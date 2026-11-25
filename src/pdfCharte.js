/*
  Charte graphique commune des PDF de Mêlée (modèle : export des déplacements).
  Partagée par App.jsx et les autres écrans (comptes rendus, …).
*/

export const PDF_YELLOW = [227, 177, 0];
export const PDF_BLACK = [20, 20, 20];
export const PDF_ZEBRA = [246, 244, 236];
export const PDF_RULE = [225, 222, 210];
export const PDF_MUTED = [120, 120, 120];

export function pdfPageSize(doc) {
  return {
    W: doc.internal.pageSize.getWidth(),
    H: doc.internal.pageSize.getHeight(),
  };
}

// Bandeau noir + filet jaune + logo + titre jaune, identique aux déplacements.
export function pdfDrawBanner(doc, { logo, title, lines = [] }) {
  const { W } = pdfPageSize(doc);
  const M = 12;

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

  const now = new Date();
  const generated = `Document généré le ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  const maxTitleW = W - M - titleX;

  doc.setTextColor(...PDF_YELLOW);
  doc.setFont('helvetica', 'bold');
  let titleSize = 18;
  doc.setFontSize(titleSize);
  while (titleSize > 12 && doc.getTextWidth(title) > maxTitleW) {
    titleSize -= 1;
    doc.setFontSize(titleSize);
  }
  doc.text(doc.splitTextToSize(title, maxTitleW)[0], titleX, 13);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  lines
    .filter(Boolean)
    .slice(0, 2)
    .forEach((l, i) => {
      doc.text(doc.splitTextToSize(l, maxTitleW)[0], titleX, 19.5 + i * 4.8);
    });
  doc.setFontSize(7);
  doc.setTextColor(200, 200, 200);
  doc.text(generated, W - M, 28, { align: 'right' });

  return 40;
}

// Bas de page noir sur toutes les pages : club · module / saison / pagination.
export function pdfDrawFooters(doc, { moduleLabel, seasonLabel }) {
  const { W, H } = pdfPageSize(doc);
  const M = 12;
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFillColor(...PDF_BLACK);
    doc.rect(0, H - 9, W, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`US Baumoise Rugby · ${moduleLabel}`, M, H - 3.5);
    if (seasonLabel) {
      doc.setTextColor(...PDF_YELLOW);
      doc.text(`Saison ${seasonLabel}`, W / 2, H - 3.5, { align: 'center' });
      doc.setTextColor(255, 255, 255);
    }
    doc.text(`Page ${p} / ${pages}`, W - M, H - 3.5, { align: 'right' });
  }
}

// Titre de section : texte noir gras souligné d'un filet jaune.
export function pdfSectionTitle(doc, y, x, width, title, info) {
  doc.setTextColor(...PDF_BLACK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(title, x, y + 5);
  if (info) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...PDF_MUTED);
    doc.text(info, x + width, y + 5, { align: 'right' });
  }
  doc.setFillColor(...PDF_YELLOW);
  doc.rect(x, y + 7, width, 0.8, 'F');
  return y + 11;
}

/*
  Tableau au style des déplacements : en-tête jaune, lignes zébrées,
  filets beiges, en-tête répété après chaque saut de page.
  rows : [{ cells: { key: string | string[] }, kind?: 'subtotal' | 'empty' }]
*/
export function pdfTable(doc, { x0, y, cols, rows, emptyText }) {
  const { H } = pdfPageSize(doc);
  const bottom = H - 16;
  const tableW = cols.reduce((s, c) => s + c.w, 0);

  function drawHeader() {
    doc.setFillColor(...PDF_YELLOW);
    doc.rect(x0, y, tableW, 8, 'F');
    doc.setTextColor(...PDF_BLACK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    let x = x0;
    cols.forEach((c) => {
      doc.text(c.label, c.right ? x + c.w - 2 : x + 2, y + 5.4, {
        align: c.right ? 'right' : 'left',
      });
      x += c.w;
    });
    y += 8;
    doc.setFont('helvetica', 'normal');
  }

  if (y + 16 > bottom) {
    doc.addPage();
    y = 14;
  }
  drawHeader();

  if (rows.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...PDF_MUTED);
    doc.text(emptyText || 'Aucune donnée.', x0 + 2, y + 5.5);
    doc.setDrawColor(...PDF_RULE);
    doc.line(x0, y + 8, x0 + tableW, y + 8);
    return y + 8;
  }

  let zebra = 0;
  rows.forEach((row) => {
    doc.setFontSize(8.5);
    const cellLines = {};
    let maxLines = 1;
    cols.forEach((c) => {
      const v = row.cells[c.key];
      const lines = Array.isArray(v)
        ? v
        : doc.splitTextToSize(v == null || v === '' ? '' : String(v), c.w - 4);
      cellLines[c.key] = lines;
      maxLines = Math.max(maxLines, lines.length);
    });
    const rowH = Math.max(7, maxLines * 4.2 + 3);

    if (y + rowH > bottom) {
      doc.addPage();
      y = 14;
      drawHeader();
    }

    if (row.kind === 'subtotal') {
      doc.setFillColor(252, 240, 196);
      doc.rect(x0, y, tableW, rowH, 'F');
    } else if (zebra % 2 === 1) {
      doc.setFillColor(...PDF_ZEBRA);
      doc.rect(x0, y, tableW, rowH, 'F');
    }
    if (row.kind !== 'subtotal') zebra += 1;

    let x = x0;
    cols.forEach((c) => {
      const muted = row.kind === 'empty' && c.key !== cols[0].key;
      doc.setTextColor(...(muted ? PDF_MUTED : PDF_BLACK));
      doc.setFont(
        'helvetica',
        row.kind === 'subtotal' || c.bold ? 'bold' : 'normal'
      );
      doc.setFontSize(8.5);
      doc.text(cellLines[c.key], c.right ? x + c.w - 2 : x + 2, y + 4.8, {
        align: c.right ? 'right' : 'left',
      });
      x += c.w;
    });
    doc.setDrawColor(...PDF_RULE);
    doc.line(x0, y + rowH, x0 + tableW, y + rowH);
    y += rowH;
  });

  return y;
}

// Ligne de total noire à texte jaune (comme le TOTAL des déplacements).
export function pdfTotalRow(doc, { x0, y, width, label, value }) {
  const { H } = pdfPageSize(doc);
  if (y + 9 > H - 16) {
    doc.addPage();
    y = 14;
  }
  doc.setFillColor(...PDF_BLACK);
  doc.rect(x0, y, width, 9, 'F');
  doc.setTextColor(...PDF_YELLOW);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(label, x0 + 2, y + 6);
  if (value) doc.text(value, x0 + width - 2, y + 6, { align: 'right' });
  return y + 9;
}

// Encadré récapitulatif (bordure et bandeau jaunes).
export function pdfSummaryBox(doc, { x0, y, width, title, items }) {
  const { H } = pdfPageSize(doc);
  const boxH = 12 + items.length * 4.8;
  if (y + boxH > H - 16) {
    doc.addPage();
    y = 14;
  }
  doc.setDrawColor(...PDF_YELLOW);
  doc.setLineWidth(0.8);
  doc.rect(x0, y, width, boxH);
  doc.setLineWidth(0.2);
  doc.setFillColor(...PDF_YELLOW);
  doc.rect(x0, y, width, 7, 'F');
  doc.setTextColor(...PDF_BLACK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(title, x0 + 3, y + 5);
  items.forEach(([label, value], i) => {
    const ly = y + 12 + i * 4.8;
    const last = i === items.length - 1;
    doc.setFont('helvetica', last ? 'bold' : 'normal');
    doc.setFontSize(last ? 10 : 9);
    doc.text(label, x0 + 3, ly);
    doc.text(value, x0 + width - 3, ly, { align: 'right' });
  });
  return y + boxH;
}

// Logo du club en data URL, mis en cache pour tous les PDF.
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
