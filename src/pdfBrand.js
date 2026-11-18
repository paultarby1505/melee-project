/* =========================================================
   CHARTE PDF COMMUNE (US Baumoise Rugby)
   A4 paysage, bandeau noir avec logo, accents jaunes,
   tableaux à en-tête jaune et pied de page noir.
   Tous les exports PDF de l'app passent par ces helpers.
========================================================= */

import { jsPDF } from 'jspdf';

export const PDF_YELLOW = [227, 177, 0];
export const PDF_BLACK = [20, 20, 20];
const ZEBRA = [246, 244, 236];
const RULE = [225, 222, 210];
const MUTED = [120, 120, 120];
const SUBTOTAL = [250, 236, 181];

let usbLogoCache;

export async function loadUsbLogo() {
  if (usbLogoCache !== undefined) return usbLogoCache;
  try {
    const res = await fetch('/logo-usb.png');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    usbLogoCache = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Logo indisponible pour le PDF', e);
    usbLogoCache = null;
  }
  return usbLogoCache;
}

function frSpaces(s) {
  return s.replace(/ | /g, ' ');
}

export function pdfMoney(n) {
  return frSpaces(
    `${(Number(n) || 0).toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} €`
  );
}

export function pdfKm(n) {
  return frSpaces(
    `${(Number(n) || 0).toLocaleString('fr-FR', {
      maximumFractionDigits: 1,
    })} km`
  );
}

/**
 * Crée un document A4 paysage avec le bandeau d'en-tête de la charte.
 * Renvoie un contexte `ctx` à passer aux autres helpers.
 */
export function createBrandedPdf({
  title,
  subtitle,
  infoLine,
  logo,
  footerLabel,
  centerLabel,
}) {
  const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });
  const ctx = {
    doc,
    W: 297,
    H: 210,
    M: 12,
    top: 14,
    bottom: 210 - 16,
    y: 40,
    footerLabel: footerLabel || 'US Baumoise Rugby',
    centerLabel: centerLabel || '',
  };
  const { W, M } = ctx;

  doc.setFillColor(...PDF_BLACK);
  doc.rect(0, 0, W, 30, 'F');
  doc.setFillColor(...PDF_YELLOW);
  doc.rect(0, 30, W, 1.6, 'F');

  let titleX = M;
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', M, 4, 35, 22);
      titleX = M + 40;
    } catch (e) {
      console.warn(e);
    }
  }
  doc.setTextColor(...PDF_YELLOW);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(title, titleX, 13);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (subtitle) doc.text(subtitle, titleX, 20);
  if (infoLine) doc.text(infoLine, titleX, 25);
  const now = new Date();
  const generated = `Document généré le ${now.toLocaleDateString(
    'fr-FR'
  )} à ${now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
  doc.text(generated, W - M, 20, { align: 'right' });

  return ctx;
}

/** Saute de page si `needed` mm ne tiennent plus. Renvoie true si nouvelle page. */
export function ensurePdfSpace(ctx, needed) {
  if (ctx.y + needed > ctx.bottom) {
    ctx.doc.addPage();
    ctx.y = ctx.top;
    return true;
  }
  return false;
}

/** Titre de section : barre jaune à gauche, texte noir en gras. */
export function drawPdfSectionTitle(ctx, text, sub) {
  const { doc, M } = ctx;
  ensurePdfSpace(ctx, 22);
  doc.setFillColor(...PDF_YELLOW);
  doc.rect(M, ctx.y, 1.8, 7, 'F');
  doc.setTextColor(...PDF_BLACK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(text, M + 4, ctx.y + 5.3);
  if (sub) {
    const w = doc.getTextWidth(text);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(sub, M + 4 + w + 4, ctx.y + 5.3);
  }
  ctx.y += 10;
}

/**
 * Tableau de la charte.
 * cols : [{ key, label, w?, right?, bold? }] — les colonnes sans `w`
 *   se partagent la largeur restante (pleine largeur de page).
 * rows : [{ [key]: string, _subtotal?: bool }] — `_subtotal` = ligne de
 *   sous-total (fond jaune clair, gras). Valeur null → « — », '' → vide.
 * total : objet ligne affiché en bandeau noir/jaune (optionnel).
 */
export function drawPdfTable(ctx, { cols, rows, total, emptyLabel }) {
  const { doc, W, M } = ctx;
  const avail = W - 2 * M;
  const fixed = cols.reduce((s, c) => s + (c.w || 0), 0);
  const flexCount = cols.filter((c) => !c.w).length;
  const flexW = flexCount ? Math.max(20, (avail - fixed) / flexCount) : 0;
  const widths = cols.map((c) => c.w || flexW);
  const tableW = widths.reduce((s, w) => s + w, 0);
  const x0 = (W - tableW) / 2;

  function header() {
    doc.setFillColor(...PDF_YELLOW);
    doc.rect(x0, ctx.y, tableW, 8, 'F');
    doc.setTextColor(...PDF_BLACK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    let x = x0;
    cols.forEach((c, i) => {
      doc.text(c.label, c.right ? x + widths[i] - 2 : x + 2, ctx.y + 5.4, {
        align: c.right ? 'right' : 'left',
      });
      x += widths[i];
    });
    ctx.y += 8;
    doc.setFont('helvetica', 'normal');
  }

  ensurePdfSpace(ctx, 16);
  header();

  if (rows.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(emptyLabel || 'Aucune donnée.', x0 + 2, ctx.y + 7);
    ctx.y += 12;
  }

  let zebra = 0;
  rows.forEach((row) => {
    doc.setFontSize(8.5);
    const cells = cols.map((c, i) => {
      const v = row[c.key];
      if (v == null) return ['—'];
      if (v === '') return [''];
      return doc
        .splitTextToSize(String(v), widths[i] - 4)
        .slice(0, c.maxLines || 6);
    });
    const nLines = Math.max(...cells.map((l) => l.length));
    const rowH = Math.max(7, nLines * 4.2 + 3);
    if (ensurePdfSpace(ctx, rowH)) header();

    if (row._subtotal) {
      doc.setFillColor(...SUBTOTAL);
      doc.rect(x0, ctx.y, tableW, rowH, 'F');
      doc.setTextColor(...PDF_BLACK);
    } else {
      if (zebra % 2 === 1) {
        doc.setFillColor(...ZEBRA);
        doc.rect(x0, ctx.y, tableW, rowH, 'F');
      }
      zebra += 1;
      doc.setTextColor(...PDF_BLACK);
    }
    doc.setFontSize(8.5);
    let x = x0;
    cols.forEach((c, i) => {
      const v = row[c.key];
      if (row._subtotal && (v == null || v === '')) {
        x += widths[i];
        return;
      }
      doc.setFont('helvetica', c.bold || row._subtotal ? 'bold' : 'normal');
      doc.text(cells[i], c.right ? x + widths[i] - 2 : x + 2, ctx.y + 4.8, {
        align: c.right ? 'right' : 'left',
      });
      x += widths[i];
    });
    doc.setDrawColor(...(row._subtotal ? PDF_YELLOW : RULE));
    doc.line(x0, ctx.y + rowH, x0 + tableW, ctx.y + rowH);
    ctx.y += rowH;
  });

  if (total) {
    ensurePdfSpace(ctx, 9);
    doc.setFillColor(...PDF_BLACK);
    doc.rect(x0, ctx.y, tableW, 9, 'F');
    doc.setTextColor(...PDF_YELLOW);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    if (total.label) doc.text(total.label, x0 + 2, ctx.y + 6);
    let x = x0;
    cols.forEach((c, i) => {
      const v = total[c.key];
      if (v != null && v !== '') {
        doc.text(String(v), c.right ? x + widths[i] - 2 : x + 2, ctx.y + 6, {
          align: c.right ? 'right' : 'left',
        });
      }
      x += widths[i];
    });
    ctx.y += 9;
  }

  ctx.y += 6;
  ctx.tableX = x0;
  return ctx.y;
}

/** Encadré récapitulatif (titre jaune, lignes libellé / valeur, dernière en gras). */
export function drawPdfSummaryBox(ctx, title, lines, { x, width = 120 } = {}) {
  const { doc } = ctx;
  const bx = x ?? ctx.tableX ?? ctx.M;
  const boxH = 12 + lines.length * 4.8;
  ensurePdfSpace(ctx, boxH + 2);
  const y = ctx.y;
  doc.setDrawColor(...PDF_YELLOW);
  doc.setLineWidth(0.8);
  doc.rect(bx, y, width, boxH);
  doc.setLineWidth(0.2);
  doc.setFillColor(...PDF_YELLOW);
  doc.rect(bx, y, width, 7, 'F');
  doc.setTextColor(...PDF_BLACK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(title, bx + 3, y + 5);
  lines.forEach(([label, value], i) => {
    const ly = y + 12 + i * 4.8;
    const last = i === lines.length - 1;
    doc.setFont('helvetica', last ? 'bold' : 'normal');
    doc.setFontSize(last ? 10 : 9);
    doc.text(label, bx + 3, ly);
    doc.text(String(value), bx + width - 3, ly, { align: 'right' });
  });
  ctx.y = y + boxH + 6;
}

/** Pied de page noir sur toutes les pages. À appeler en dernier. */
export function finalizeBrandedPdf(ctx) {
  const { doc, W, H, M } = ctx;
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFillColor(...PDF_BLACK);
    doc.rect(0, H - 9, W, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(ctx.footerLabel, M, H - 3.5);
    if (ctx.centerLabel) {
      doc.setTextColor(...PDF_YELLOW);
      doc.text(ctx.centerLabel, W / 2, H - 3.5, { align: 'center' });
      doc.setTextColor(255, 255, 255);
    }
    doc.text(`Page ${p} / ${pages}`, W - M, H - 3.5, { align: 'right' });
  }
  return doc;
}
