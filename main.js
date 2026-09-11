/* ------------------------------------------------------------------
   Tableau de pilotage du projet, visualisateur 3D
   Three.js en ESM via importmap. Aucun build, aucun asset binaire.
   Le contenu textuel vit dans content.js.
   ------------------------------------------------------------------ */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { board } from "./content.js";

/* ============================================================ 1. CONSTANTES */

/** Ratio du panneau. 3/2 comme spécifié, 4/3 pour coller au board physique. */
const BOARD_RATIO = 3 / 2;
const BOARD_W = 1.2;
const BOARD_H = BOARD_W / BOARD_RATIO;
const BOARD_D = 0.025;

/** Marge entre le bord du panneau et la zone imprimée. */
const FACE_INSET = 0.01;
const FACE_W = BOARD_W - 2 * FACE_INSET;
const FACE_H = BOARD_H - 2 * FACE_INSET;

/** Épaisseurs de placement, en mètres. */
const Z_FACE = BOARD_D / 2 + 0.0004;
const Z_SHEET = Z_FACE + 0.0005; // relief de 0,5 mm
const Z_DETAIL = Z_SHEET + 0.0022;
const SHEET_LIFT = 0.006; // soulèvement au survol

const PALETTE = {
  boardBg: "#101318",
  boardBgDeep: "#0a0c10",
  frame: "#080a0d",
  edge: "#333a45",
  orange: "#f04e23",
  navy: "#1e3a5f",
  paper: "#ffffff",
  ink: "#16181d",
  inkSoft: "#5b6270",
  inkFaint: "#98a0ad",
  line: "#e3e6ec",
};

const FONT = '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif';

/**
 * Mise en page du recto, en mètres, origine en haut à gauche de la zone imprimée.
 * Toutes les feuilles ont le format A4 paysage. Dans un bloc, chaque colonne
 * remplit toute la hauteur disponible : une colonne à une seule feuille donne
 * donc une grande feuille, une colonne à deux feuilles donne deux feuilles
 * plus petites. C'est ce qui produit le grand Kanban du board physique.
 */
const LAYOUT = {
  header: { x: 0.02, y: 0.014, w: FACE_W - 0.04, h: 0.078 },
  rows: {
    a: { y: 0.11, h: 0.373 },
    b: { y: 0.499, h: 0.267 },
  },
  cols: {
    l: { x: 0.02, w: 0.342 },
    r: { x: 0.396, w: 0.764 },
  },
  bannerH: 0.043,
  bannerGap: 0.012,
  blockPadBottom: 0.01,
  sheetGap: 0.016,
  colGap: 0.024,
  aspect: Math.SQRT2, // A4 paysage
};

/**
 * Position de chaque bloc pilier et répartition de ses feuilles en colonnes.
 * Pour ajouter une feuille, ajoutez son id dans une colonne. Un id absent
 * d'ici est ajouté automatiquement à la colonne la plus courte du bloc.
 */
const BLOCKS = {
  value: { row: "a", col: "l", columns: [["questionnaire", "product-architecture"]] },
  "rft-jit": {
    row: "a",
    col: "r",
    columns: [["user-stories-takt", "defects-visualization"], ["feature-kanban"]],
  },
  "network-of-teams": { row: "b", col: "l", columns: [["tech-working-conditions"]] },
  "learning-organization": { row: "b", col: "r", columns: [["dantotsu"], ["weak-point-management"]] },
};

/* ============================================================ 2. UTILITAIRES CANVAS */

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Découpe un texte en lignes qui tiennent dans maxWidth. */
function wrapLines(ctx, text, maxWidth, maxLines = Infinity) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? line + " " + word : word;
    if (ctx.measureText(candidate).width <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && words.length) {
    const last = lines[maxLines - 1];
    if (ctx.measureText(last).width > maxWidth - 20) {
      lines[maxLines - 1] = last.replace(/\s+\S*$/, "") + "...";
    }
  }
  return lines;
}

function makeCanvas(w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return { canvas, ctx: canvas.getContext("2d") };
}

let maxAnisotropy = 1;

function toTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  return texture;
}

/** Ombre douce dessinée directement dans un canvas. */
function softShadow(ctx, x, y, w, h, blur, alpha, dy = 0) {
  ctx.save();
  ctx.shadowColor = `rgba(0,0,0,${alpha})`;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetY = dy;
  ctx.fillStyle = "#000";
  roundRect(ctx, x, y, w, h, 4);
  ctx.fill();
  ctx.restore();
}

/**
 * Logo Theodo, tracé vectoriel officiel.
 * Une hampe qui se recourbe vers la droite, une barre à droite de la hampe,
 * un point séparé. Coordonnées normalisées sur la boîte d'encre du signe.
 */
const LOGO = {
  stemX: 0.3971, stemW: 0.1016, top: 0.2031,
  arcY: 0.5182, arcR: 0.2070, arcCX: 0.6042,
  barX: 0.3464, barY: 0.3620, barW: 0.2317, barH: 0.0885,
  dotX: 0.7292, dotY: 0.7370, dotR: 0.0599,
  inkX: 0.3464, inkY: 0.2031, inkW: 0.4427, inkH: 0.5938,
};

/** Largeur du logo pour une hauteur donnée. */
function logoWidth(height) {
  return (LOGO.inkW / LOGO.inkH) * height;
}

/** Dessine le logo, coin haut gauche de la boîte d'encre en x, y. */
function drawTheodoLogo(ctx, x, y, height, color) {
  const k = height / LOGO.inkH;
  ctx.save();
  ctx.translate(x - LOGO.inkX * k, y - LOGO.inkY * k);
  ctx.scale(k, k);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = LOGO.stemW;
  ctx.lineCap = "butt";

  // Hampe puis crochet
  ctx.beginPath();
  ctx.moveTo(LOGO.stemX, LOGO.top);
  ctx.lineTo(LOGO.stemX, LOGO.arcY);
  ctx.arc(LOGO.arcCX, LOGO.arcY, LOGO.arcR, Math.PI, Math.PI / 2, true);
  ctx.stroke();

  // Barre
  ctx.fillRect(LOGO.barX, LOGO.barY, LOGO.barW, LOGO.barH);

  // Point
  ctx.beginPath();
  ctx.arc(LOGO.dotX, LOGO.dotY, LOGO.dotR, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* ============================================================ 3. TEXTURE D'UNE FEUILLE */

/**
 * Génère la texture d'une feuille de standard.
 *
 * Tout est dessiné en millimètres réels de la feuille, puis converti en pixels.
 * La typographie garde donc la même taille physique sur toutes les feuilles,
 * qu'elles soient au format A4 ou plus grandes comme le Kanban.
 *
 * Gère le word-wrap, la hiérarchie typographique et la pastille du pilier.
 * 6 lignes de puces au maximum, le détail va dans le panneau HTML.
 */
function makeSheetTexture({ title, bullets, accentColor, cadence, worldWidth = 0.2065 }) {
  const mmW = worldWidth * 1000;
  const mmH = mmW / LAYOUT.aspect;
  const W = Math.round(THREE.MathUtils.clamp(mmW * 7, 512, 2400));
  const H = Math.round(W / LAYOUT.aspect);
  const { canvas, ctx } = makeCanvas(W, H);
  const s = W / mmW; // pixels par millimètre

  ctx.fillStyle = PALETTE.paper;
  ctx.fillRect(0, 0, W, H);

  const M = 15 * s;
  const bandH = 11 * s;
  ctx.textBaseline = "alphabetic";

  // Bandeau de tête, cadence à gauche et logo Theodo à droite.
  // Le titre passe dessous, il ne peut donc jamais les chevaucher.
  drawTheodoLogo(ctx, W - M - logoWidth(bandH), M, bandH, PALETTE.orange);

  if (cadence) {
    ctx.font = `600 ${6.4 * s}px ${FONT}`;
    ctx.textAlign = "center";
    const bw = ctx.measureText(cadence).width + 15 * s;
    ctx.fillStyle = "#f1f3f7";
    roundRect(ctx, M, M + 0.5 * s, bw, 10.5 * s, 5.2 * s);
    ctx.fill();
    ctx.fillStyle = PALETTE.inkSoft;
    ctx.fillText("\u21bb  " + cadence, M + bw / 2, M + 8 * s);
  }

  // Titre, sous le bandeau de tête
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.orange;
  const titleMm = title.length > 24 ? 14.5 : 17;
  ctx.font = `700 ${titleMm * s}px ${FONT}`;
  const titleLines = wrapLines(ctx, title, W - 2 * M, 2);
  let y = M + bandH + (titleMm + 2) * s;
  for (const line of titleLines) {
    ctx.fillText(line, W / 2, y);
    y += titleMm * 1.12 * s;
  }

  // Filet de séparation
  y += 11 * s;
  ctx.strokeStyle = PALETTE.line;
  ctx.lineWidth = Math.max(1, 0.5 * s);
  ctx.beginPath();
  ctx.moveTo(M, y);
  ctx.lineTo(W - M, y);
  ctx.stroke();

  // Puces, 6 lignes au maximum
  ctx.textAlign = "left";
  const bulletMm = 9.4;
  const lineH = bulletMm * 1.32 * s;
  y += (bulletMm + 6) * s;
  ctx.font = `500 ${bulletMm * s}px ${FONT}`;
  const textX = M + 9 * s;
  const maxW = W - M - textX;
  // 6 lignes au maximum, et on s'arrête net si le bas de la fiche est atteint
  const bottom = H - M * 0.8;
  let lineBudget = 6;

  for (const bullet of bullets) {
    if (lineBudget <= 0 || y > bottom) break;
    const lines = wrapLines(ctx, bullet, maxW, Math.min(2, lineBudget));
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(M + 2.6 * s, y - bulletMm * 0.34 * s, 1.9 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2c313b";
    for (const line of lines) {
      if (y > bottom) break;
      ctx.fillText(line, textX, y);
      y += lineH;
      lineBudget -= 1;
    }
    y += 3.4 * s;
  }

  // Liseré du bord de feuille
  ctx.strokeStyle = "#dfe3ea";
  ctx.lineWidth = Math.max(1, 0.6 * s);
  ctx.strokeRect(0.5 * s, 0.5 * s, W - 1 * s, H - 1 * s);

  return toTexture(canvas);
}

/* ============================================================ 4. TEXTURE DU RECTO */

function drawAvatar(ctx, x, y, r, label, color) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = r * 0.1;
  ctx.strokeStyle = "rgba(255,255,255,.22)";
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = `700 ${r * 0.72}px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, y + r * 0.02);
  ctx.restore();
}

function makeFrontTexture(rects) {
  const PX = 2400 / FACE_W; // pixels par mètre
  const W = Math.round(FACE_W * PX);
  const H = Math.round(FACE_H * PX);
  const { canvas, ctx } = makeCanvas(W, H);
  const m = (v) => v * PX; // mètres vers pixels

  // Fond du panneau
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#161a21");
  bg.addColorStop(1, PALETTE.boardBgDeep);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.textBaseline = "middle";

  /* Bande d'en-tête */
  const hd = LAYOUT.header;
  const hx = m(hd.x);
  const hy = m(hd.y);
  const hh = m(hd.h);
  const hw = m(hd.w);

  const labelBox = (x, w, text) => {
    ctx.fillStyle = PALETTE.navy;
    ctx.fillRect(x, hy, w, hh);
    ctx.fillStyle = "#fff";
    ctx.font = `700 ${hh * 0.2}px ${FONT}`;
    ctx.textAlign = "center";
    const lines = wrapLines(ctx, text, w - 24, 2);
    let ly = hy + hh / 2 - ((lines.length - 1) * hh * 0.26) / 2;
    for (const line of lines) {
      ctx.fillText(line, x + w / 2, ly);
      ly += hh * 0.26;
    }
  };

  // Zone 1, promesse
  const z1w = hw * 0.145;
  labelBox(hx, z1w, board.header.promise.label);
  const cardX = hx + z1w + m(0.004);
  const cardW = hw * 0.245;
  ctx.fillStyle = PALETTE.paper;
  ctx.fillRect(cardX, hy, cardW, hh);
  ctx.fillStyle = PALETTE.ink;
  ctx.font = `700 ${hh * 0.25}px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillText(board.header.promise.project, cardX + cardW / 2, hy + hh * 0.24);
  ctx.font = `450 ${hh * 0.145}px ${FONT}`;
  ctx.fillStyle = PALETTE.inkSoft;
  const promiseLines = wrapLines(ctx, board.header.promise.text, cardW - 28, 4);
  let py = hy + hh * 0.45;
  for (const line of promiseLines) {
    ctx.fillText(line, cardX + cardW / 2, py);
    py += hh * 0.165;
  }

  // Zone 2, équipe
  const z2x = hx + hw * 0.44;
  const z2w = hw * 0.145;
  labelBox(z2x, z2w, board.header.team.label);
  const av = hh * 0.33;
  const members = board.header.team.members;
  const perRow = Math.ceil(members.length / (members.length > 3 ? 2 : 1));
  members.forEach((name, i) => {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    const rowCount = Math.min(perRow, members.length - row * perRow);
    const spacing = av * 2.35;
    const startX = z2x + z2w + m(0.03) + ((perRow - rowCount) * spacing) / 2;
    const cy = members.length > 3 ? hy + hh * (row === 0 ? 0.33 : 0.74) : hy + hh / 2;
    drawAvatar(ctx, startX + col * spacing, cy, av, name.slice(0, 2), "#8f9bb0");
  });

  // Zone 3, SPA
  const z3x = hx + hw * 0.755;
  const z3w = hw * 0.175;
  labelBox(z3x, z3w, board.header.spa.label);
  drawAvatar(ctx, z3x + z3w + m(0.03), hy + hh / 2, av, board.header.spa.members[0].slice(0, 2), "#8f9bb0");

  /* Bandeaux des piliers */
  for (const pillar of board.pillars) {
    const block = rects.blocks[pillar.id];
    if (!block) continue;
    const bx = m(block.banner.x);
    const by = m(block.banner.y);
    const bw = m(block.banner.w);
    const bh = m(block.banner.h);
    ctx.fillStyle = PALETTE.orange;
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = "#fff";
    ctx.font = `700 ${bh * 0.44}px ${FONT}`;
    ctx.textAlign = "center";
    // Intitulé imprimé du tableau physique, à défaut le nom du thème
    ctx.fillText(pillar.bannerLabel || pillar.label, bx + bw / 2, by + bh / 2 + bh * 0.02);
  }

  /* Ombres portées des feuilles, cuites dans le fond */
  for (const id of Object.keys(rects.sheets)) {
    const r = rects.sheets[id];
    softShadow(ctx, m(r.x), m(r.y), m(r.w), m(r.h), m(0.014), 0.55, m(0.004));
  }

  return toTexture(canvas);
}

/* ============================================================ 5. TEXTURE DU VERSO */

function makeBackTexture() {
  const PX = 2400 / FACE_W;
  const W = Math.round(FACE_W * PX);
  const H = Math.round(FACE_H * PX);
  const { canvas, ctx } = makeCanvas(W, H);
  const m = (v) => v * PX;

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#161a21");
  bg.addColorStop(1, PALETTE.boardBgDeep);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "middle";

  /* En-tête, intention du tableau. Sa hauteur suit le nombre de lignes. */
  const pad = m(0.024);
  ctx.font = `500 ${m(0.0155)}px ${FONT}`;
  const introLines = wrapLines(ctx, board.intention, W - 2 * pad - m(0.044), 5);
  const headH = m(0.055) + (introLines.length - 1) * m(0.022) + m(0.024);

  ctx.fillStyle = PALETTE.navy;
  ctx.fillRect(pad, pad, W - 2 * pad, headH);
  ctx.textAlign = "left";
  ctx.fillStyle = "#fff";
  ctx.font = `700 ${m(0.021)}px ${FONT}`;
  ctx.fillText("À quoi sert ce tableau ?", pad + m(0.022), pad + m(0.024));
  ctx.font = `500 ${m(0.0155)}px ${FONT}`;
  ctx.fillStyle = "rgba(255,255,255,.86)";
  let iy = pad + m(0.055);
  for (const line of introLines) {
    ctx.fillText(line, pad + m(0.022), iy);
    iy += m(0.022);
  }

  /* Deux panneaux, ils occupent la place restante jusqu'au pied de page */
  const footTop = m(0.708);
  const panelY = pad + headH + m(0.022);
  const panelH = footTop - m(0.024) - panelY;
  const gap = m(0.024);
  const panelW = (W - 2 * pad - gap) / 2;

  const panel = (x, title, draw) => {
    softShadow(ctx, x, panelY, panelW, panelH, m(0.016), 0.5, m(0.005));
    ctx.fillStyle = PALETTE.paper;
    roundRect(ctx, x, panelY, panelW, panelH, m(0.006));
    ctx.fill();
    ctx.fillStyle = PALETTE.orange;
    ctx.fillRect(x, panelY, panelW, m(0.05));
    ctx.fillStyle = "#fff";
    ctx.font = `700 ${m(0.023)}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText(title, x + panelW / 2, panelY + m(0.026));
    draw(x + m(0.026), panelY + m(0.078), panelW - m(0.052));
  };

  panel(pad, "Points de vigilance", (x, y, w) => {
    const available = panelY + panelH - m(0.02) - y;
    const textW = w - m(0.024);

    /* Ajustement automatique : on cherche le plus grand corps de texte qui
       fasse tenir les points de vigilance et l'encadré dans le panneau.
       Ajouter une ligne dans content.js réduit simplement la taille. */
    let fit = null;
    for (const size of [0.0185, 0.0172, 0.016, 0.0149, 0.0138, 0.0128, 0.0118]) {
      const goodSize = size * 0.89;
      ctx.font = `500 ${m(size)}px ${FONT}`;
      const errs = board.errors.map((e) => wrapLines(ctx, e, textW, 4));
      ctx.font = `500 ${m(goodSize)}px ${FONT}`;
      const goods = board.goodBoard.map((g) => wrapLines(ctx, g, textW, 3));

      const total =
        errs.reduce((sum, l) => sum + l.length * size * 1.4 + size * 0.95, 0) +
        size * 3.2 + // filet et intertitre de l'encadré
        goods.reduce((sum, l) => sum + l.length * goodSize * 1.4 + goodSize * 0.6, 0);

      if (m(total) <= available || size === 0.0118) {
        fit = { size, goodSize, errs, goods };
        break;
      }
    }

    ctx.textAlign = "left";
    let cy = y + m(0.012);

    ctx.font = `500 ${m(fit.size)}px ${FONT}`;
    fit.errs.forEach((lines) => {
      ctx.fillStyle = PALETTE.orange;
      ctx.beginPath();
      ctx.arc(x + m(0.006), cy - m(0.005), m(0.0045), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2c313b";
      lines.forEach((line) => {
        ctx.fillText(line, x + m(0.022), cy);
        cy += m(fit.size * 1.4);
      });
      cy += m(fit.size * 0.95);
    });

    // Encadré des signes d'un tableau utile
    cy += m(fit.size * 0.6);
    ctx.strokeStyle = PALETTE.line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, cy - m(fit.size * 0.7));
    ctx.lineTo(x + w, cy - m(fit.size * 0.7));
    ctx.stroke();
    ctx.fillStyle = PALETTE.inkFaint;
    ctx.font = `700 ${m(fit.size * 0.76)}px ${FONT}`;
    ctx.fillText("LES SIGNES D'UN TABLEAU UTILE", x, cy);
    cy += m(fit.size * 1.6);

    ctx.font = `500 ${m(fit.goodSize)}px ${FONT}`;
    fit.goods.forEach((lines) => {
      ctx.fillStyle = PALETTE.orange;
      ctx.beginPath();
      ctx.arc(x + m(0.006), cy - m(0.005), m(0.004), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.inkSoft;
      lines.forEach((line) => {
        ctx.fillText(line, x + m(0.022), cy);
        cy += m(fit.goodSize * 1.4);
      });
      cy += m(fit.goodSize * 0.6);
    });
  });

  panel(pad + panelW + gap, "Comprendre son utilisation", (x, y, w) => {
    const colW = [w * 0.42, w * 0.58];
    const available = panelY + panelH - m(0.018) - y;

    /* Ajustement automatique : on cherche le plus grand corps de texte
       qui fasse tenir toutes les lignes du tableau dans le panneau.
       Ajouter une ligne dans content.js réduit simplement la taille. */
    let fontMm = 0.0145, lineH = 0.0195, rowGap = 0.021, rows = null;
    for (const size of [0.0145, 0.0135, 0.0125, 0.0118, 0.011, 0.0103, 0.0096]) {
      ctx.font = `500 ${m(size)}px ${FONT}`;
      const candidate = board.usage.map((row) => ({
        left: wrapLines(ctx, row.question, colW[0] - m(0.012), 5),
        right: wrapLines(ctx, row.answer, colW[1] - m(0.012), 5),
      }));
      const lh = size * 1.36;
      const gapRow = size * 1.45;
      const total = candidate.reduce(
        (sum, r) => sum + Math.max(r.left.length, r.right.length) * lh + gapRow, m(0.026) / (2400 / FACE_W)
      );
      if (total <= available / (2400 / FACE_W) || size === 0.0096) {
        fontMm = size; lineH = lh; rowGap = gapRow; rows = candidate;
        break;
      }
    }

    ctx.textAlign = "left";
    ctx.font = `700 ${m(0.0122)}px ${FONT}`;
    ctx.fillStyle = PALETTE.inkFaint;
    ctx.fillText("QUESTION", x, y);
    ctx.fillText("RÉPONSE", x + colW[0] + m(0.012), y);

    let cy = y + m(0.024);
    ctx.font = `500 ${m(fontMm)}px ${FONT}`;
    rows.forEach((row) => {
      ctx.strokeStyle = PALETTE.line;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, cy - m(0.011));
      ctx.lineTo(x + w, cy - m(0.011));
      ctx.stroke();
      ctx.fillStyle = PALETTE.inkSoft;
      row.left.forEach((line, k) => ctx.fillText(line, x, cy + k * m(lineH)));
      ctx.fillStyle = "#2c313b";
      row.right.forEach((line, k) => ctx.fillText(line, x + colW[0] + m(0.012), cy + k * m(lineH)));
      cy += Math.max(row.left.length, row.right.length) * m(lineH) + m(rowGap);
    });
  });

  /* Pied de page */
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,.42)";
  ctx.font = `500 ${m(0.0155)}px ${FONT}`;
  let footY = footTop + m(0.006);
  for (const line of wrapLines(ctx, board.subtitle, W - 2 * pad - m(0.24), 2)) {
    ctx.fillText(line, W / 2, footY);
    footY += m(0.022);
  }

  return toTexture(canvas);
}

/* ============================================================ 6. CALCUL DE LA MISE EN PAGE */

/** Retourne les rectangles de chaque bloc et de chaque feuille, en mètres. */
function computeLayout() {
  const blocks = {};
  const sheets = {};

  for (const pillar of board.pillars) {
    const spec = BLOCKS[pillar.id];
    const ids = pillar.standards.map((s) => s.id);
    if (!spec) {
      console.warn(`[board] Pilier "${pillar.id}" sans emplacement défini dans BLOCKS, ignoré.`);
      continue;
    }

    // Colonnes déclarées, filtrées sur les feuilles réellement présentes
    const columns = spec.columns.map((col) => col.filter((id) => ids.includes(id)));
    // Feuilles ajoutées dans content.js mais absentes de BLOCKS
    const placed = new Set(columns.flat());
    for (const id of ids) {
      if (placed.has(id)) continue;
      const shortest = columns.reduce((a, b) => (b.length < a.length ? b : a), columns[0] || []);
      if (shortest) shortest.push(id);
      else columns.push([id]);
      console.info(`[board] Feuille "${id}" placée automatiquement dans le bloc "${pillar.id}".`);
    }
    const usable = columns.filter((c) => c.length);
    if (!usable.length) continue;

    const row = LAYOUT.rows[spec.row];
    const col = LAYOUT.cols[spec.col];

    const banner = { x: col.x, y: row.y, w: col.w, h: LAYOUT.bannerH };
    const contentY = row.y + LAYOUT.bannerH + LAYOUT.bannerGap;
    const contentH = row.h - LAYOUT.bannerH - LAYOUT.bannerGap - LAYOUT.blockPadBottom;

    // Chaque colonne remplit la hauteur, sa largeur découle du format A4
    const colSizes = usable.map((ids2) => {
      const h = (contentH - LAYOUT.sheetGap * (ids2.length - 1)) / ids2.length;
      return { h, w: h * LAYOUT.aspect };
    });

    let totalW = colSizes.reduce((sum, c) => sum + c.w, 0) + LAYOUT.colGap * (usable.length - 1);
    let scale = 1;
    if (totalW > col.w) {
      scale = col.w / totalW; // repli si le bloc déborde
      totalW = col.w;
    }

    let cx = col.x + (col.w - totalW) / 2;
    usable.forEach((ids2, ci) => {
      const size = { w: colSizes[ci].w * scale, h: colSizes[ci].h * scale };
      let cy = contentY + (contentH - (size.h * ids2.length + LAYOUT.sheetGap * (ids2.length - 1))) / 2;
      ids2.forEach((id) => {
        sheets[id] = { x: cx, y: cy, w: size.w, h: size.h, pillar: pillar.id };
        cy += size.h + LAYOUT.sheetGap;
      });
      cx += size.w + LAYOUT.colGap;
    });

    blocks[pillar.id] = { banner, x: col.x, y: row.y, w: col.w, h: row.h };
  }

  return { blocks, sheets };
}

/** Convertit un rectangle de la mise en page vers le repère centré de la face. */
function rectToLocal(r) {
  return {
    x: r.x + r.w / 2 - FACE_W / 2,
    y: FACE_H / 2 - (r.y + r.h / 2),
  };
}

/* ============================================================ 7. SCÈNE */

const canvasEl = document.getElementById("scene");
const state = {
  sheets: [],          // { id, mesh, outline, standard, pillar, rect, lifted }
  hovered: null,
  selected: null,
  focused: null,
  side: "front",
  idle: true,
  lastInteraction: performance.now(),
  needsRender: true,
  anim: null,
};

let renderer, scene, camera, controls, boardPivot, boardBody, raycaster;
let homeView = { position: new THREE.Vector3(), target: new THREE.Vector3() };

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGL2RenderingContext && c.getContext("webgl2")) ||
           !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch (e) {
    return false;
  }
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  // PCFSoftShadowMap est retiré des versions récentes de three.
  // VSM est son remplaçant et accepte un vrai flou, via radius et blurSamples.
  renderer.shadowMap.type = THREE.VSMShadowMap;
  maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
}

function initScene() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.05, 60);
  camera.position.set(0, 0.06, 2);

  // Éclairage trois points
  const key = new THREE.DirectionalLight(0xffffff, 2.5);
  key.position.set(1.7, 2.4, 2.3);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 8;
  key.shadow.blurSamples = 16;
  key.shadow.bias = -0.0002;
  key.shadow.normalBias = 0.012;
  const cam = key.shadow.camera;
  cam.left = -1.4; cam.right = 1.4; cam.top = 1.4; cam.bottom = -1.4;
  cam.near = 0.5; cam.far = 8;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xdbe6ff, 0.85);
  fill.position.set(-2.4, 0.5, 1.7);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, 1.6);
  rim.position.set(-1.1, 1.3, -2.6);
  scene.add(rim);

  scene.add(new THREE.HemisphereLight(0xeef3ff, 0.55));

  // Sol invisible, ne reçoit que l'ombre
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 9),
    new THREE.ShadowMaterial({ opacity: 0.13 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.66;
  floor.receiveShadow = true;
  scene.add(floor);

  // Ombre de contact douce, l'objet est en lévitation
  scene.add(makeContactShadow());

  raycaster = new THREE.Raycaster();
}

function makeContactShadow() {
  const { canvas, ctx } = makeCanvas(512, 512);
  const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  g.addColorStop(0, "rgba(30,36,48,.42)");
  g.addColorStop(0.45, "rgba(30,36,48,.17)");
  g.addColorStop(1, "rgba(30,36,48,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 1.5),
    new THREE.MeshBasicMaterial({ map: toTexture(canvas), transparent: true, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -0.655;
  mesh.renderOrder = -1;
  return mesh;
}

/* ============================================================ 8. CONSTRUCTION DU PANNEAU */

function buildBoard() {
  const rects = computeLayout();

  boardPivot = new THREE.Group(); // pivot au centre géométrique du panneau
  boardBody = new THREE.Group();  // porte l'oscillation de repos
  boardPivot.add(boardBody);
  scene.add(boardPivot);

  /* Corps du panneau, coins biseautés */
  const r = 0.018;
  const shape = new THREE.Shape();
  const hw = BOARD_W / 2, hh = BOARD_H / 2;
  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
  shape.lineTo(hw, hh - r);
  shape.quadraticCurveTo(hw, hh, hw - r, hh);
  shape.lineTo(-hw + r, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
  shape.lineTo(-hw, -hh + r);
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);

  // Avec un biseau, l'extrusion va de -bevelThickness à depth + bevelThickness.
  // On centre donc sur -depth / 2 pour que le solide occupe exactement BOARD_D.
  const bevel = 0.002;
  const depth = BOARD_D - 2 * bevel;
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 8,
  });
  geo.translate(0, 0, -depth / 2);

  const frameMesh = new THREE.Mesh(geo, [
    new THREE.MeshStandardMaterial({ color: PALETTE.frame, roughness: 0.62, metalness: 0.08 }),
    new THREE.MeshStandardMaterial({ color: PALETTE.edge, roughness: 0.45, metalness: 0.22 }),
  ]);
  frameMesh.castShadow = true;
  frameMesh.receiveShadow = true;
  boardBody.add(frameMesh);

  /* Recto */
  const front = new THREE.Mesh(
    new THREE.PlaneGeometry(FACE_W, FACE_H),
    new THREE.MeshStandardMaterial({ map: makeFrontTexture(rects), roughness: 0.86, metalness: 0 })
  );
  front.position.z = Z_FACE;
  front.receiveShadow = true;
  boardBody.add(front);

  /* Verso */
  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(FACE_W, FACE_H),
    new THREE.MeshStandardMaterial({ map: makeBackTexture(), roughness: 0.86, metalness: 0 })
  );
  back.position.z = -Z_FACE;
  back.rotation.y = Math.PI;
  back.receiveShadow = true;
  boardBody.add(back);

  /* Feuilles */
  for (const pillar of board.pillars) {
    for (const standard of pillar.standards) {
      const rect = rects.sheets[standard.id];
      if (!rect) continue;
      const local = rectToLocal(rect);

      const texture = makeSheetTexture({
        title: standard.boardTitle,
        bullets: standard.bullets || [],
        accentColor: pillar.color,
        cadence: standard.cadence,
        worldWidth: rect.w,
      });

      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(rect.w, rect.h),
        new THREE.MeshStandardMaterial({ map: texture, roughness: 0.94, metalness: 0, transparent: true })
      );
      mesh.position.set(local.x, local.y, Z_SHEET);
      mesh.castShadow = true;
      mesh.userData.id = standard.id;
      boardBody.add(mesh);

      // Liseré de la couleur du pilier, révélé au survol
      const bw = 0.0055;
      const outline = new THREE.Mesh(
        new THREE.PlaneGeometry(rect.w + bw * 2, rect.h + bw * 2),
        new THREE.MeshBasicMaterial({ color: pillar.color, transparent: true, opacity: 0, depthWrite: false })
      );
      outline.position.set(local.x, local.y, Z_SHEET - 0.0002);
      boardBody.add(outline);

      state.sheets.push({
        id: standard.id,
        mesh,
        outline,
        standard,
        pillar,
        rect,
        local,
        lift: 0,
        targetLift: 0,
        glow: 0,
        targetGlow: 0,
        dim: 0,
        targetDim: 0,
      });
    }
  }

  addDetails(rects);
  return rects;
}

/** Aimant et post-it corné. Discrets, ils donnent vie à l'objet. */
function addDetails(rects) {
  // Aimant, coin haut droit de la face
  const magnet = new THREE.Mesh(
    new THREE.CylinderGeometry(0.011, 0.011, 0.005, 24),
    new THREE.MeshStandardMaterial({ color: "#e03a3a", roughness: 0.35, metalness: 0.15 })
  );
  magnet.rotation.x = Math.PI / 2;
  magnet.position.set(FACE_W / 2 - 0.03, FACE_H / 2 - 0.028, Z_DETAIL);
  magnet.castShadow = true;
  boardBody.add(magnet);

  // Post-it corné, posé sur un coin de feuille
  const anchor = rects.sheets["weak-point-management"] || Object.values(rects.sheets)[0];
  if (anchor) {
    const local = rectToLocal(anchor);
    const size = 0.052;
    const { canvas, ctx } = makeCanvas(256, 256);
    ctx.fillStyle = "#ffd84d";
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = "rgba(0,0,0,.12)";
    ctx.beginPath();
    ctx.moveTo(256, 200);
    ctx.lineTo(256, 256);
    ctx.lineTo(196, 256);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#6b5a10";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    [90, 128, 166].forEach((y, i) => {
      ctx.beginPath();
      ctx.moveTo(44, y);
      ctx.lineTo(212 - i * 42, y);
      ctx.stroke();
    });
    const postIt = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size, 4, 4),
      new THREE.MeshStandardMaterial({ map: toTexture(canvas), roughness: 0.95, side: THREE.DoubleSide })
    );
    // Coin corné, on relève un sommet du maillage
    const pos = postIt.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      const k = Math.max(0, (x / (size / 2)) * 0.5 + 0.5) * Math.max(0, (-y / (size / 2)) * 0.5 + 0.5);
      pos.setZ(i, Math.pow(k, 4) * 0.012);
    }
    postIt.geometry.computeVertexNormals();
    postIt.position.set(local.x + anchor.w / 2 - 0.012, local.y - anchor.h / 2 + 0.008, Z_DETAIL);
    postIt.rotation.z = -0.09;
    postIt.castShadow = true;
    boardBody.add(postIt);
  }

}

/* ============================================================ 9. CADRAGE ET VUES */

/** Distance nécessaire pour cadrer un rectangle w x h, marge comprise. */
function fitDistance(w, h, margin = 1.16) {
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const dV = (h / 2) / Math.tan(vFov / 2);
  const dH = (w / 2) / (Math.tan(vFov / 2) * camera.aspect);
  return Math.max(dV, dH) * margin;
}

function computeHomeView() {
  // En portrait l'objet est cadré sur sa largeur, on laisse peu de marge
  const margin = window.innerWidth < 860 ? 1.05 : 1.16;
  const d = fitDistance(BOARD_W, BOARD_H, margin);
  homeView.position.set(0, BOARD_H * 0.06, d);
  homeView.target.set(0, 0, 0);
}

/**
 * Zone d'écran réellement libre, le panneau latéral ou la bottom sheet
 * masquant une partie de la vue.
 */
function freeViewport() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (!document.body.classList.contains("is-panel-open")) return { w, h, dx: 0, dy: 0 };
  const panel = document.getElementById("panel");
  // dx et dy sont le déplacement à appliquer à la caméra, en pixels écran,
  // pour que l'objet visé se recentre dans la zone restée visible.
  if (w < 860) {
    const ph = Math.min(panel.offsetHeight, h * 0.66);
    return { w, h: h - ph, dx: 0, dy: -ph / 2 }; // caméra vers le bas
  }
  const pw = panel.offsetWidth;
  return { w: w - pw, h, dx: pw / 2, dy: 0 };    // caméra vers la droite
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function animateTo(position, target, duration = 700) {
  state.anim = {
    fromPos: camera.position.clone(),
    fromTarget: controls.target.clone(),
    toPos: position.clone(),
    toTarget: target.clone(),
    start: performance.now(),
    duration,
  };
  controls.enabled = false;
  invalidate();
}

function stepAnim(now) {
  const a = state.anim;
  const t = Math.min(1, (now - a.start) / a.duration);
  const k = easeInOutCubic(t);
  camera.position.lerpVectors(a.fromPos, a.toPos, k);
  controls.target.lerpVectors(a.fromTarget, a.toTarget, k);
  if (t >= 1) {
    state.anim = null;
    controls.enabled = true;
  }
}

function goHome() {
  computeHomeView();
  state.side = "front";
  animateTo(homeView.position, homeView.target);
  syncToolbar();
}

function goSide(side) {
  computeHomeView();
  state.side = side;
  const z = side === "front" ? homeView.position.z : -homeView.position.z;
  animateTo(new THREE.Vector3(0, homeView.position.y, z), homeView.target);
  syncToolbar();
}

/** Cadre une feuille de face dans la zone d'écran restée libre. */
function focusSheet(entry) {
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const free = freeViewport();
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const t = Math.tan(vFov / 2);

  // La feuille doit tenir dans la fraction d'écran encore visible.
  // L'étendue horizontale dépend du ratio de la fenêtre, pas de celui de la zone libre.
  const dV = (entry.rect.h / 2) / (t * (free.h / winH));
  const dH = (entry.rect.w / 2) / (t * camera.aspect * (free.w / winW));
  const dist = THREE.MathUtils.clamp(Math.max(dV, dH) * 1.28, controls.minDistance, controls.maxDistance);

  const quat = boardBody.getWorldQuaternion(new THREE.Quaternion());
  const worldPos = new THREE.Vector3(entry.local.x, entry.local.y, Z_SHEET);
  boardBody.localToWorld(worldPos);

  // Recentrage sur la zone libre. free.dx et free.dy sont déjà exprimés
  // comme un déplacement de caméra, en pixels écran.
  const visibleH = 2 * t * dist;
  const visibleW = visibleH * camera.aspect;
  const shift = new THREE.Vector3(1, 0, 0).applyQuaternion(quat)
    .multiplyScalar((free.dx / winW) * visibleW)
    .add(new THREE.Vector3(0, 1, 0).applyQuaternion(quat)
      .multiplyScalar((free.dy / winH) * visibleH));

  const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
  const target = worldPos.clone().add(shift);
  const position = worldPos.clone().add(normal.multiplyScalar(dist)).add(shift);
  animateTo(position, target);
}

/* ============================================================ 10. INTERACTIONS */

const pointer = new THREE.Vector2();
const tooltip = document.getElementById("tooltip");
const hint = document.getElementById("hint");

function invalidate() {
  state.needsRender = true;
}

/**
 * Activité légère de la souris. Coupe la rotation automatique, qui gênerait
 * le pointage, mais laisse vivre l'oscillation de repos.
 */
function markPointerActivity() {
  state.lastInteraction = performance.now();
  if (controls && controls.autoRotate) {
    controls.autoRotate = false;
    invalidate();
  }
}

function markInteraction() {
  state.lastInteraction = performance.now();
  if (state.idle) {
    state.idle = false;
    invalidate();
  }
  if (controls && controls.autoRotate) controls.autoRotate = false;
  hint.classList.add("is-hidden");
}

function pickSheet(clientX, clientY) {
  pointer.x = (clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(state.sheets.map((s) => s.mesh), false);
  if (!hits.length) return null;
  return state.sheets.find((s) => s.mesh === hits[0].object) || null;
}

function setHovered(entry) {
  if (state.hovered === entry) return;
  state.hovered = entry;
  canvasEl.classList.toggle("is-pointer", !!entry);
  if (entry) {
    tooltip.hidden = false;
    tooltip.innerHTML =
      `<span class="tooltip__pillar">${entry.pillar.label}</span>${entry.standard.boardTitle}`;
  } else {
    tooltip.hidden = true;
  }
  updateSheetTargets();
  invalidate();
}

function updateSheetTargets() {
  for (const s of state.sheets) {
    const active = state.selected === s;
    const highlighted = state.hovered === s || state.focused === s;
    s.targetLift = active ? SHEET_LIFT * 1.6 : highlighted ? SHEET_LIFT : 0;
    s.targetGlow = active || highlighted ? 1 : 0;
    s.targetDim = state.selected && !active ? 1 : 0;
  }
}

function stepSheets(dt) {
  let moving = false;
  const k = 1 - Math.pow(0.001, dt);
  for (const s of state.sheets) {
    if (Math.abs(s.lift - s.targetLift) > 1e-5) {
      s.lift += (s.targetLift - s.lift) * k;
      s.mesh.position.z = Z_SHEET + s.lift;
      s.outline.position.z = Z_SHEET + s.lift - 0.0002;
      moving = true;
    }
    if (Math.abs(s.glow - s.targetGlow) > 1e-3) {
      s.glow += (s.targetGlow - s.glow) * k;
      s.outline.material.opacity = s.glow;
      moving = true;
    }
    if (Math.abs(s.dim - s.targetDim) > 1e-3) {
      s.dim += (s.targetDim - s.dim) * k;
      s.mesh.material.opacity = 1 - s.dim * 0.72;
      s.outline.material.opacity = Math.min(s.outline.material.opacity, 1 - s.dim);
      moving = true;
    }
  }
  return moving;
}

function selectSheet(entry) {
  state.selected = entry;
  document.body.classList.add("is-panel-open");
  document.body.classList.remove("is-panel-collapsed");
  renderPanel(entry);
  updateSheetTargets();
  setHovered(null);
  focusSheet(entry);
}

function clearSelection() {
  if (!state.selected) return;
  state.selected = null;
  document.body.classList.remove("is-panel-open", "is-panel-collapsed");
  // Panneau fermé, ses commandes sortent de l'ordre de tabulation
  panelEl.inert = true;
  updateSheetTargets();
  goHome();
}

/* ============================================================ 11. PANNEAU HTML */

const panelEl = document.getElementById("panel");
const panelScroll = document.getElementById("panel-scroll");

function esc(str) {
  return String(str).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function renderPanel(entry) {
  const { standard, pillar } = entry;
  panelEl.style.setProperty("--accent", pillar.color);

  // Intitulé d'origine du thème, puis sa traduction française
  let html = `<span class="p-eyebrow">`;
  html += `<span class="p-eyebrow__en">${esc(pillar.bannerLabel || pillar.label)}</span>`;
  if (pillar.bannerLabel && pillar.bannerLabel !== pillar.label) {
    html += `<span class="p-eyebrow__fr">${esc(pillar.label)}</span>`;
  }
  html += `</span>`;
  html += `<h2 class="p-title">${esc(standard.boardTitle || standard.title)}</h2>`;

  html += `<p class="p-sub">Guide de l'équipe`;
  if (standard.cadence) html += `<span class="p-cadence">${esc(standard.cadence)}</span>`;
  html += `</p>`;

  html += `<p class="p-h">À quoi sert cette fiche ?</p>`;
  html += `<p class="p-intent">${esc(standard.intent)}</p>`;
  if (standard.note) html += `<p class="p-note">${esc(standard.note)}</p>`;

  if (pillar.objectives && pillar.objectives.length) {
    html += `<p class="p-h">À quoi sert ce thème ?</p><ul class="p-list">`;
    html += pillar.objectives.map((o) => `<li>${esc(o)}</li>`).join("");
    html += `</ul>`;
  }

  if (standard.bullets && standard.bullets.length) {
    html += `<p class="p-h">Sur la fiche</p><ul class="p-list">`;
    html += standard.bullets.map((b) => `<li>${esc(b)}</li>`).join("");
    html += `</ul>`;
  }

  for (const section of standard.details || []) {
    html += `<p class="p-h">${esc(section.heading)}</p><ul class="p-list">`;
    html += section.items.map((i) => `<li>${esc(i)}</li>`).join("");
    html += `</ul>`;
  }

  panelScroll.innerHTML = html;
  panelScroll.scrollTop = 0;
  panelEl.hidden = false;
  panelEl.inert = false;
}

/* ============================================================ 12. BARRE D'OUTILS */

function syncToolbar() {
  document.querySelectorAll(".toolbar__btn").forEach((btn) => {
    const action = btn.dataset.action;
    let active = false;
    if (action === "front") active = state.side === "front";
    if (action === "back") active = state.side === "back";
    if (action === "front" || action === "back") {
      btn.setAttribute("aria-pressed", String(active));
    }
    btn.classList.toggle("is-active", active);
  });
}

function bindToolbar() {
  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    markInteraction();
    if (action === "front") { clearSelection(); goSide("front"); }
    if (action === "back") { clearSelection(); goSide("back"); }
    if (action === "close") clearSelection();
  });

}

/* ============================================================ 13. ACCESSIBILITÉ CLAVIER */

const a11yRoot = document.getElementById("a11y-targets");
const projected = new THREE.Vector3();

function buildA11yTargets() {
  a11yRoot.innerHTML = "";
  state.sheets.forEach((entry) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "a11y-target";
    btn.dataset.sheet = entry.id;
    btn.textContent = `${entry.standard.boardTitle}, thème : ${entry.pillar.label}`;
    btn.addEventListener("focus", () => {
      state.focused = entry;
      markInteraction();
      updateSheetTargets();
      invalidate();
    });
    btn.addEventListener("blur", () => {
      if (state.focused === entry) state.focused = null;
      updateSheetTargets();
      invalidate();
    });
    btn.addEventListener("click", () => selectSheet(entry));
    // Activation clavier explicite, sans dépendre de la synthèse du clic
    btn.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        selectSheet(entry);
      }
    });
    a11yRoot.appendChild(btn);
    entry.a11y = btn;
  });
}

/** Place chaque cible clavier sur la projection écran de sa feuille. */
function syncA11yTargets() {
  const w = window.innerWidth, h = window.innerHeight;
  for (const entry of state.sheets) {
    if (!entry.a11y) continue;
    const geo = entry.mesh.geometry.parameters;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, behind = 0;
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      projected.set((sx * geo.width) / 2, (sy * geo.height) / 2, 0);
      entry.mesh.localToWorld(projected);
      projected.project(camera);
      if (projected.z > 1) behind++;
      const px = (projected.x * 0.5 + 0.5) * w;
      const py = (-projected.y * 0.5 + 0.5) * h;
      minX = Math.min(minX, px); maxX = Math.max(maxX, px);
      minY = Math.min(minY, py); maxY = Math.max(maxY, py);
    }
    const visible = behind === 0 && maxX > 0 && minX < w && maxY > 0 && minY < h;
    entry.a11y.style.display = visible ? "block" : "none";
    entry.a11y.style.left = `${minX}px`;
    entry.a11y.style.top = `${minY}px`;
    entry.a11y.style.width = `${Math.max(2, maxX - minX)}px`;
    entry.a11y.style.height = `${Math.max(2, maxY - minY)}px`;
  }
}

/* ============================================================ 14. ÉVÉNEMENTS */

function bindEvents() {
  let downX = 0, downY = 0, dragged = false;

  canvasEl.addEventListener("pointerdown", (e) => {
    downX = e.clientX; downY = e.clientY; dragged = false;
    canvasEl.classList.add("is-grabbing");
    markInteraction();
  });

  canvasEl.addEventListener("pointermove", (e) => {
    if (e.buttons) {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) dragged = true;
      setHovered(null);
      return;
    }
    if (e.pointerType === "touch") return;
    markPointerActivity();
    tooltip.style.left = `${e.clientX}px`;
    tooltip.style.top = `${e.clientY}px`;
    setHovered(state.anim ? null : pickSheet(e.clientX, e.clientY));
  });

  canvasEl.addEventListener("pointerup", (e) => {
    canvasEl.classList.remove("is-grabbing");
    if (dragged) return;
    markInteraction();
    const entry = pickSheet(e.clientX, e.clientY);
    if (entry) selectSheet(entry);
    else clearSelection();
  });

  canvasEl.addEventListener("pointerleave", () => setHovered(null));
  canvasEl.addEventListener("wheel", markInteraction, { passive: true });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { markInteraction(); clearSelection(); }
  });

  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) invalidate(); });

  bindBottomSheetDrag();
}

/** Bottom sheet glissable sur mobile. */
function bindBottomSheetDrag() {
  const grip = panelEl.querySelector(".panel__grip");
  let startY = 0, moved = 0, dragging = false;

  const start = (e) => {
    if (window.innerWidth >= 860) return;
    dragging = true; startY = e.clientY; moved = 0;
    panelEl.style.transition = "none";
    grip.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (!dragging) return;
    moved = e.clientY - startY;
    const base = document.body.classList.contains("is-panel-collapsed")
      ? panelEl.offsetHeight - 132 : 0;
    panelEl.style.transform = `translateY(${Math.max(0, base + moved)}px)`;
  };
  const end = () => {
    if (!dragging) return;
    dragging = false;
    panelEl.style.transition = "";
    panelEl.style.transform = "";
    if (moved > 90) {
      if (document.body.classList.contains("is-panel-collapsed")) clearSelection();
      else document.body.classList.add("is-panel-collapsed");
    } else if (moved < -60) {
      document.body.classList.remove("is-panel-collapsed");
    }
  };

  grip.addEventListener("pointerdown", start);
  grip.addEventListener("pointermove", move);
  grip.addEventListener("pointerup", end);
  grip.addEventListener("pointercancel", end);
}

function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h, false);
  computeHomeView();
  if (!state.selected && !state.anim) {
    const dir = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(controls.target).add(dir.multiplyScalar(homeView.position.length()));
  }
  invalidate();
}

/* ============================================================ 15. BOUCLE DE RENDU */

const IDLE_DELAY = 8000;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let lastFrame = performance.now();

function loop(now) {
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;

  let dirty = state.needsRender;

  if (state.anim) { stepAnim(now); dirty = true; }
  if (controls.update()) dirty = true;
  if (stepSheets(dt)) dirty = true;

  // Oscillation de repos, arrêtée dès la première interaction
  if (state.idle && !reduceMotion && !document.hidden) {
    const t = now / 1000;
    boardBody.rotation.y = Math.sin((t * Math.PI * 2) / 6) * THREE.MathUtils.degToRad(2);
    boardBody.rotation.x = Math.sin((t * Math.PI * 2) / 6 + 1.1) * THREE.MathUtils.degToRad(0.7);
    dirty = true;
  } else if (boardBody.rotation.y !== 0 || boardBody.rotation.x !== 0) {
    boardBody.rotation.y *= 0.92;
    boardBody.rotation.x *= 0.92;
    if (Math.abs(boardBody.rotation.y) < 1e-4) { boardBody.rotation.y = 0; boardBody.rotation.x = 0; }
    dirty = true;
  }

  // Rotation automatique après inactivité
  // Rotation de présentation après une longue inactivité, coupée au premier geste
  if (!controls.autoRotate && !state.selected && now - state.lastInteraction > IDLE_DELAY) {
    controls.autoRotate = true;
    dirty = true;
  }

  if (dirty) {
    renderer.render(scene, camera);
    syncA11yTargets();
    state.needsRender = false;
  }
}

/* ============================================================ 16. REPLI SANS WEBGL */

function renderFallback(reason) {
  const el = document.getElementById("fallback");
  let html = `<h1>${esc(board.title)}</h1>`;
  html += `<p class="fb-note">${esc(reason)}</p>`;
  html += `<h2>À quoi sert ce tableau ?</h2>`;
  html += `<p>${esc(board.intention)}</p>`;
  html += `<p>${esc(board.subtitle)}</p>`;
  html += `<h2>Les quatre thèmes du projet</h2>`;

  for (const pillar of board.pillars) {
    html += `<h2>${esc(pillar.label)}</h2>`;
    html += `<ul>${pillar.objectives.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>`;
    for (const s of pillar.standards) {
      html += `<h3>${esc(s.boardTitle)}${s.cadence ? ` (${esc(s.cadence)})` : ""}</h3>`;
      html += `<p>${esc(s.intent)}</p>`;
      if (s.note) html += `<p><em>${esc(s.note)}</em></p>`;
      html += `<ul>${(s.bullets || []).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;
      for (const d of s.details || []) {
        html += `<p><strong>${esc(d.heading)}</strong></p>`;
        html += `<ul>${d.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
      }
    }
  }

  html += `<h2>Points de vigilance</h2><ul>${board.errors.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>`;
  html += `<h2>Les signes d'un tableau utile</h2><ul>${board.goodBoard.map((g) => `<li>${esc(g)}</li>`).join("")}</ul>`;
  html += `<h2>Comprendre son utilisation</h2><table><thead><tr><th>Question</th><th>Réponse</th></tr></thead><tbody>`;
  html += board.usage.map((r) => `<tr><td>${esc(r.question)}</td><td>${esc(r.answer)}</td></tr>`).join("");
  html += `</tbody></table>`;

  el.innerHTML = html;
  el.hidden = false;
  document.body.classList.add("is-fallback");
}

/* ============================================================ 17. DÉMARRAGE */

function init() {
  // ?fallback=1 force la version statique, pratique pour la vérifier
  const forced = new URLSearchParams(location.search).has("fallback");
  if (forced || !supportsWebGL()) {
    renderFallback(forced
      ? "Vous consultez la version texte du tableau. Toutes les fiches sont disponibles ci-dessous."
      : "Votre navigateur ne peut pas afficher le tableau en 3D. Retrouvez ci-dessous toutes les fiches en version texte.");
    return;
  }

  try {
    initRenderer();
    initScene();
    buildBoard();
  } catch (error) {
    console.error(error);
    renderFallback("Le tableau en 3D n'a pas pu démarrer. Retrouvez ci-dessous toutes les fiches en version texte.");
    return;
  }

  controls = new OrbitControls(camera, canvasEl);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = false;
  controls.rotateSpeed = 0.85;
  controls.zoomSpeed = 0.9;
  controls.minDistance = 0.24;
  controls.maxDistance = 6;
  controls.minPolarAngle = Math.PI / 2 - THREE.MathUtils.degToRad(75);
  controls.maxPolarAngle = Math.PI / 2 + THREE.MathUtils.degToRad(75);
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.55;
  controls.addEventListener("start", markInteraction);
  controls.addEventListener("change", invalidate);

  computeHomeView();
  camera.position.copy(homeView.position);
  controls.target.copy(homeView.target);
  controls.update();

  panelEl.inert = true;
  buildA11yTargets();
  bindEvents();
  bindToolbar();
  syncToolbar();
  renderer.setAnimationLoop(loop);
}

init();
