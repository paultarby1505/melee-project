import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  Square,
  Upload,
  ScrollText,
  ArrowLeft,
  Check,
  Pencil,
  Search,
  ExternalLink,
  Trash2,
  Plus,
  X,
  FileUp,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import {
  PDF_BLACK,
  PDF_MUTED,
  PDF_YELLOW,
  pdfPageSize,
  pdfDrawBanner,
  pdfDrawFooters,
  pdfSectionTitle,
  pdfTable,
  loadUsbLogo,
} from './pdfCharte.js';

/*
  Section « Comptes rendus » :
  - rédiger (ou dicter) les notes d'une réunion, les faire mettre en forme
    par l'IA, relire, retoucher, écouter, puis valider → PDF rangé dans
    Documents > Comptes rendus ;
  - déposer les comptes rendus d'autres réunions (fichiers externes).
*/

const CR_FOLDER_NAME = 'Comptes rendus';
const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;

const EMPTY_CONTENT = {
  resume: '',
  points: [],
  decisions: [],
  actions: [],
  prochaine_reunion: '',
};

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function formatDateLong(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateShort(iso) {
  if (!iso) return 'Sans date';
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function seasonOf(iso) {
  if (!iso) return '';
  const [y, m] = iso.split('-').map(Number);
  const start = m >= 7 ? y : y - 1;
  return `${start}-${start + 1}`;
}

function fileSafe(str) {
  return (
    String(str || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 60) || 'compte_rendu'
  );
}

// Normalise ce que renvoie l'IA (ou ce qui est en base) dans la forme attendue.
function normalizeContent(c) {
  const src = c && typeof c === 'object' ? c : {};
  const str = (v) => (typeof v === 'string' ? v : '');
  return {
    resume: str(src.resume),
    points: Array.isArray(src.points)
      ? src.points.map((p) => ({ titre: str(p?.titre), contenu: str(p?.contenu) }))
      : [],
    decisions: Array.isArray(src.decisions)
      ? src.decisions.map(str)
      : [],
    actions: Array.isArray(src.actions)
      ? src.actions.map((a) => ({
          action: str(a?.action),
          responsable: str(a?.responsable),
          echeance: str(a?.echeance),
        }))
      : [],
    prochaine_reunion: str(src.prochaine_reunion),
  };
}

function cleanContent(c) {
  const n = normalizeContent(c);
  return {
    resume: n.resume.trim(),
    points: n.points
      .map((p) => ({ titre: p.titre.trim(), contenu: p.contenu.trim() }))
      .filter((p) => p.titre || p.contenu),
    decisions: n.decisions.map((d) => d.trim()).filter(Boolean),
    actions: n.actions
      .map((a) => ({
        action: a.action.trim(),
        responsable: a.responsable.trim(),
        echeance: a.echeance.trim(),
      }))
      .filter((a) => a.action),
    prochaine_reunion: n.prochaine_reunion.trim(),
  };
}

function hasContent(c) {
  const n = cleanContent(c);
  return Boolean(
    n.resume || n.points.length || n.decisions.length || n.actions.length
  );
}

function mapRow(r) {
  return {
    id: r.id,
    source: r.source,
    status: r.status,
    title: r.title,
    meetingDate: r.meeting_date || '',
    location: r.location || '',
    participants: r.participants || '',
    notes: r.notes || '',
    content: r.content ? normalizeContent(r.content) : null,
    documentId: r.document_id,
    createdBy: r.created_by || '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    validatedBy: r.validated_by || '',
    validatedAt: r.validated_at,
  };
}

/* ---------------------------------------------------------
   PDF (charte commune : bandeau noir, filets jaunes, tableau)
--------------------------------------------------------- */

export function buildCompteRenduPdf(cr, logo) {
  const doc = new jsPDF({ format: 'a4' });
  const { W, H } = pdfPageSize(doc);
  const M = 12;
  const width = W - 2 * M;
  const bottom = H - 16;
  const content = cleanContent(cr.content);

  const infoLines = [
    [cr.meetingDate && capitalize(formatDateLong(cr.meetingDate)), cr.location]
      .filter(Boolean)
      .join(' · '),
    cr.participants && `Participants : ${cr.participants}`,
  ];

  let y = pdfDrawBanner(doc, {
    logo,
    title: `Compte rendu · ${cr.title}`,
    lines: infoLines,
  });

  function ensure(h) {
    if (y + h > bottom) {
      doc.addPage();
      y = 14;
    }
  }

  function paragraph(text, { bold = false, size = 10, indent = 0, gap = 2 } = {}) {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...PDF_BLACK);
    const lh = size * 0.45;
    String(text)
      .split(/\n+/)
      .forEach((para) => {
        const lines = doc.splitTextToSize(para, width - indent);
        lines.forEach((line) => {
          ensure(lh);
          doc.text(line, M + indent, y + lh * 0.8);
          y += lh;
        });
        y += gap;
      });
  }

  function section(title, info) {
    ensure(24);
    y = pdfSectionTitle(doc, y, M, width, title, info);
    y += 1;
  }

  // Participants complets si la liste ne tenait pas dans le bandeau.
  if (cr.participants && cr.participants.length > 90) {
    section('Participants');
    paragraph(cr.participants, { size: 9.5 });
    y += 2;
  }

  if (content.resume) {
    section('Résumé');
    paragraph(content.resume);
    y += 3;
  }

  if (content.points.length) {
    section('Points abordés', `${content.points.length} point${content.points.length > 1 ? 's' : ''}`);
    content.points.forEach((p, i) => {
      ensure(14);
      doc.setFillColor(...PDF_YELLOW);
      doc.rect(M, y + 0.6, 1.4, 4.2, 'F');
      paragraph(`${i + 1}. ${p.titre || 'Point'}`, { bold: true, size: 10.5, indent: 3.5, gap: 1 });
      if (p.contenu) paragraph(p.contenu, { indent: 3.5, gap: 1.5 });
      y += 2;
    });
    y += 1;
  }

  if (content.decisions.length) {
    section('Décisions');
    content.decisions.forEach((d) => {
      ensure(6);
      doc.setFillColor(...PDF_YELLOW);
      doc.circle(M + 1.5, y + 2.7, 0.9, 'F');
      paragraph(d, { indent: 5, gap: 1 });
    });
    y += 3;
  }

  if (content.actions.length) {
    section('Actions à mener');
    y = pdfTable(doc, {
      x0: M,
      y,
      cols: [
        { key: 'action', label: 'Action', w: width - 50 - 36 },
        { key: 'responsable', label: 'Responsable', w: 50, bold: true },
        { key: 'echeance', label: 'Échéance', w: 36 },
      ],
      rows: content.actions.map((a) => ({
        cells: {
          action: a.action,
          responsable: a.responsable || '—',
          echeance: a.echeance || '—',
        },
      })),
    });
    y += 6;
  }

  if (content.prochaine_reunion) {
    ensure(16);
    doc.setFillColor(...PDF_BLACK);
    const lines = doc.splitTextToSize(content.prochaine_reunion, width - 50);
    const boxH = Math.max(9, lines.length * 4.4 + 4);
    doc.rect(M, y, width, boxH, 'F');
    doc.setTextColor(...PDF_YELLOW);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('PROCHAINE RÉUNION', M + 3, y + 6);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text(lines, M + 47, y + 6);
    y += boxH + 4;
  }

  if (cr.validatedBy) {
    ensure(8);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...PDF_MUTED);
    doc.text(`Compte rendu validé par ${cr.validatedBy}.`, M, y + 4);
  }

  pdfDrawFooters(doc, {
    moduleLabel: 'Comptes rendus',
    seasonLabel: seasonOf(cr.meetingDate),
  });

  return doc;
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/* ---------------------------------------------------------
   Dictée (reconnaissance vocale du navigateur)
--------------------------------------------------------- */

function getRecognitionCtor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function useDictation(onFinalText) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState('');
  const recRef = useRef(null);
  const wantRef = useRef(false);
  const cbRef = useRef(onFinalText);
  cbRef.current = onFinalText;
  const supported = Boolean(getRecognitionCtor());

  function start() {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    setError('');
    const rec = new Ctor();
    rec.lang = 'fr-FR';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let live = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) cbRef.current(r[0].transcript.trim());
        else live += r[0].transcript;
      }
      setInterim(live);
    };
    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      wantRef.current = false;
      setError(
        e.error === 'not-allowed' || e.error === 'service-not-allowed'
          ? "Accès au micro refusé : autorise le micro pour Mêlée dans les réglages du navigateur."
          : 'La dictée s’est interrompue, relance-la.'
      );
    };
    // Le navigateur coupe après un silence : on relance tant que
    // l'utilisateur n'a pas arrêté lui-même.
    rec.onend = () => {
      setInterim('');
      if (wantRef.current) {
        try {
          rec.start();
          return;
        } catch {
          // ignore
        }
      }
      setListening(false);
    };
    recRef.current = rec;
    wantRef.current = true;
    try {
      rec.start();
      setListening(true);
    } catch {
      setError('Impossible de démarrer la dictée.');
    }
  }

  function stop() {
    wantRef.current = false;
    recRef.current?.stop();
    setListening(false);
  }

  useEffect(
    () => () => {
      wantRef.current = false;
      recRef.current?.abort?.();
    },
    []
  );

  return { supported, listening, interim, error, start, stop };
}

/* ---------------------------------------------------------
   Lecture à voix haute
--------------------------------------------------------- */

function contentToSpeech(cr) {
  const c = cleanContent(cr.content);
  const parts = [`Compte rendu : ${cr.title}.`];
  if (cr.meetingDate) parts.push(`Réunion du ${formatDateLong(cr.meetingDate)}.`);
  if (c.resume) parts.push('Résumé.', c.resume);
  c.points.forEach((p, i) => parts.push(`Point ${i + 1} : ${p.titre}.`, p.contenu));
  if (c.decisions.length) parts.push('Décisions.', ...c.decisions);
  if (c.actions.length) {
    parts.push('Actions à mener.');
    c.actions.forEach((a) =>
      parts.push(
        [a.action, a.responsable && `Responsable : ${a.responsable}`, a.echeance && `Échéance : ${a.echeance}`]
          .filter(Boolean)
          .join('. ') + '.'
      )
    );
  }
  if (c.prochaine_reunion) parts.push(`Prochaine réunion : ${c.prochaine_reunion}.`);
  if (!hasContent(cr.content) && cr.notes) parts.push(cr.notes);
  return parts.filter(Boolean);
}

function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  function stop() {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  function speak(chunks) {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find((v) => v.lang === 'fr-FR' && v.localService) ||
      voices.find((v) => v.lang?.startsWith('fr'));
    // Une phrase par énoncé : certains navigateurs coupent les textes longs.
    const sentences = chunks
      .flatMap((c) => String(c).match(/[^.!?]+[.!?]*/g) || [])
      .map((s) => s.trim())
      .filter(Boolean);
    if (!sentences.length) return;
    sentences.forEach((s, i) => {
      const u = new SpeechSynthesisUtterance(s);
      u.lang = 'fr-FR';
      if (voice) u.voice = voice;
      u.rate = 1;
      if (i === sentences.length - 1) {
        u.onend = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
      }
      window.speechSynthesis.speak(u);
    });
    setSpeaking(true);
  }

  useEffect(() => () => supported && window.speechSynthesis.cancel(), [supported]);

  return { supported, speaking, speak, stop };
}

function ListenButton({ cr, small }) {
  const { supported, speaking, speak, stop } = useSpeech();
  if (!supported) return null;
  return (
    <button
      className={small ? 'icon-btn' : 'btn-secondary'}
      title={speaking ? 'Arrêter la lecture' : 'Écouter le compte rendu'}
      onClick={() => (speaking ? stop() : speak(contentToSpeech(cr)))}
    >
      {speaking ? <Square size={14} /> : <Volume2 size={14} />}
      {!small && (speaking ? 'Arrêter' : 'Écouter')}
    </button>
  );
}

/* ---------------------------------------------------------
   Appel à l'IA (fonction Vercel /api/compte-rendu)
--------------------------------------------------------- */

async function askAi(payload) {
  let res;
  try {
    res = await fetch('/api/compte-rendu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw Object.assign(new Error('Pas de connexion : réessaie quand le réseau revient.'), {
      code: 'network',
    });
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    // réponse non JSON (fonction absente en local, timeout…)
  }
  if (!res.ok || !data?.content) {
    const err = new Error(
      data?.error ||
        (res.status === 404
          ? "L'assistant IA n'est disponible que sur la version en ligne de Mêlée."
          : res.status === 504
            ? "L'IA a mis trop de temps à répondre, réessaie."
            : "L'IA est indisponible pour le moment, réessaie.")
    );
    err.code = data?.code || (res.status === 404 ? 'no_key' : 'error');
    throw err;
  }
  return normalizeContent(data.content);
}

/* ---------------------------------------------------------
   Composants d'édition
--------------------------------------------------------- */

function Field({ label, children, hint }) {
  return (
    <div>
      <label>{label}</label>
      {children}
      {hint && (
        <p className="text-xs mt-1" style={{ color: 'var(--ink-light)' }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ cr }) {
  const meta =
    cr.source === 'externe'
      ? { label: 'Déposé', bg: 'var(--tan-tint)', color: 'var(--tan-text)' }
      : cr.status === 'valide'
        ? { label: 'Validé', bg: 'var(--pitch-tint)', color: 'var(--pitch-dark)' }
        : { label: 'Brouillon', bg: 'var(--amber-tint)', color: 'var(--amber)' };
  return (
    <span className="pill" style={{ background: meta.bg, color: meta.color }}>
      {meta.label}
    </span>
  );
}

function autoGrow(e) {
  const el = e.target;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight + 2}px`;
}

function ContentEditor({ content, onChange }) {
  const c = normalizeContent(content);
  const set = (patch) => onChange({ ...c, ...patch });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Field label="Résumé">
        <textarea
          rows={4}
          value={c.resume}
          onChange={(e) => set({ resume: e.target.value })}
          onInput={autoGrow}
        />
      </Field>

      <div>
        <label>Points abordés</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {c.points.map((p, i) => (
            <div
              key={i}
              className="card"
              style={{ padding: 12, borderLeft: '3px solid var(--pitch)' }}
            >
              <div className="flex gap-2 items-center">
                <span className="text-xs" style={{ color: 'var(--ink-light)', minWidth: 18 }}>
                  {i + 1}.
                </span>
                <input
                  value={p.titre}
                  placeholder="Titre du point"
                  onChange={(e) =>
                    set({
                      points: c.points.map((x, j) => (j === i ? { ...x, titre: e.target.value } : x)),
                    })
                  }
                />
                <button
                  className="icon-btn"
                  title="Supprimer ce point"
                  onClick={() => set({ points: c.points.filter((_, j) => j !== i) })}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <textarea
                className="mt-2"
                rows={3}
                value={p.contenu}
                placeholder="Ce qui a été dit"
                onChange={(e) =>
                  set({
                    points: c.points.map((x, j) => (j === i ? { ...x, contenu: e.target.value } : x)),
                  })
                }
                onInput={autoGrow}
              />
            </div>
          ))}
          <button
            className="link-btn"
            style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            onClick={() => set({ points: [...c.points, { titre: '', contenu: '' }] })}
          >
            <Plus size={12} /> Ajouter un point
          </button>
        </div>
      </div>

      <Field label="Décisions" hint="Une décision par ligne.">
        <textarea
          rows={Math.max(3, c.decisions.length + 1)}
          value={c.decisions.join('\n')}
          onChange={(e) => set({ decisions: e.target.value.split('\n') })}
        />
      </Field>

      <div>
        <label>Actions à mener</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {c.actions.map((a, i) => (
            <div key={i} className="cr-action-row">
              <input
                value={a.action}
                placeholder="Action"
                onChange={(e) =>
                  set({ actions: c.actions.map((x, j) => (j === i ? { ...x, action: e.target.value } : x)) })
                }
              />
              <input
                value={a.responsable}
                placeholder="Responsable"
                onChange={(e) =>
                  set({ actions: c.actions.map((x, j) => (j === i ? { ...x, responsable: e.target.value } : x)) })
                }
              />
              <input
                value={a.echeance}
                placeholder="Échéance"
                onChange={(e) =>
                  set({ actions: c.actions.map((x, j) => (j === i ? { ...x, echeance: e.target.value } : x)) })
                }
              />
              <button
                className="icon-btn"
                title="Supprimer cette action"
                onClick={() => set({ actions: c.actions.filter((_, j) => j !== i) })}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            className="link-btn"
            style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            onClick={() =>
              set({ actions: [...c.actions, { action: '', responsable: '', echeance: '' }] })
            }
          >
            <Plus size={12} /> Ajouter une action
          </button>
        </div>
      </div>

      <Field label="Prochaine réunion">
        <input
          value={c.prochaine_reunion}
          placeholder="Ex. jeudi 11 décembre, 19 h, club-house"
          onChange={(e) => set({ prochaine_reunion: e.target.value })}
        />
      </Field>
    </div>
  );
}

function CompteRenduEditor({ initial, busy, onSave, onValidate, onCancel }) {
  const [cr, setCr] = useState(initial);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');
  const [instruction, setInstruction] = useState('');
  const [error, setError] = useState('');
  const notesRef = useRef(null);

  const dictation = useDictation((text) => {
    if (!text) return;
    setCr((prev) => {
      const sep = prev.notes && !/\s$/.test(prev.notes) ? ' ' : '';
      const sentence = text.charAt(0).toUpperCase() + text.slice(1);
      const end = /[.!?]$/.test(sentence) ? '' : '.';
      return { ...prev, notes: `${prev.notes}${sep}${sentence}${end}` };
    });
  });

  useEffect(() => {
    const el = notesRef.current;
    if (el && dictation.listening) el.scrollTop = el.scrollHeight;
  }, [cr.notes, dictation.listening]);

  const set = (patch) => setCr((prev) => ({ ...prev, ...patch }));

  async function runAi(withInstruction) {
    if (dictation.listening) dictation.stop();
    setAiError('');
    if (!withInstruction && !cr.notes.trim()) {
      setAiError('Écris ou dicte d’abord le contenu de la réunion.');
      return;
    }
    setAiBusy(withInstruction ? 'retouche' : 'notes');
    try {
      const content = await askAi({
        notes: cr.notes,
        title: cr.title,
        meetingDate: cr.meetingDate ? formatDateLong(cr.meetingDate) : '',
        location: cr.location,
        participants: cr.participants,
        current: withInstruction ? cleanContent(cr.content) : undefined,
        instruction: withInstruction ? instruction : undefined,
      });
      set({ content });
      if (withInstruction) setInstruction('');
    } catch (e) {
      setAiError(e.message);
    } finally {
      setAiBusy(false);
    }
  }

  function check() {
    if (!cr.title.trim()) {
      setError('Donne un titre à la réunion.');
      return false;
    }
    setError('');
    return true;
  }

  const withContent = Boolean(cr.content);

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        <button className="icon-btn" onClick={onCancel} title="Retour">
          <ArrowLeft size={14} />
        </button>
        <h1 className="font-display text-2xl" style={{ flex: 1, minWidth: 0 }}>
          {initial.title ? initial.title : 'Nouveau compte rendu'}
        </h1>
        {withContent && <ListenButton cr={cr} />}
      </div>

      <div className="pitch-divider" />

      <div className="panel" style={{ padding: 16 }}>
        <div className="cr-meta-grid">
          <Field label="Titre de la réunion">
            <input
              value={cr.title}
              placeholder="Ex. Réunion du bureau"
              onChange={(e) => set({ title: e.target.value })}
            />
          </Field>
          <Field label="Date">
            <input
              type="date"
              value={cr.meetingDate}
              onChange={(e) => set({ meetingDate: e.target.value })}
            />
          </Field>
          <Field label="Lieu">
            <input
              value={cr.location}
              placeholder="Ex. Club-house"
              onChange={(e) => set({ location: e.target.value })}
            />
          </Field>
          <Field label="Participants">
            <input
              value={cr.participants}
              placeholder="Ex. Paul, Julie, les éducateurs U10"
              onChange={(e) => set({ participants: e.target.value })}
            />
          </Field>
        </div>
      </div>

      <div className="panel mt-4" style={{ padding: 16 }}>
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <h2 className="font-display text-lg">Notes de la réunion</h2>
          {dictation.supported ? (
            <button
              className={dictation.listening ? 'btn-primary cr-rec' : 'btn-secondary'}
              onClick={() => (dictation.listening ? dictation.stop() : dictation.start())}
            >
              {dictation.listening ? <MicOff size={14} /> : <Mic size={14} />}
              {dictation.listening ? 'Arrêter la dictée' : 'Dicter'}
            </button>
          ) : (
            <span className="text-xs" style={{ color: 'var(--ink-light)' }}>
              Pour dicter, utilise le micro du clavier de ton téléphone.
            </span>
          )}
        </div>
        <textarea
          ref={notesRef}
          rows={10}
          value={cr.notes}
          placeholder="Écris ou dicte tout ce qui s'est dit, en vrac : l'IA remettra en ordre."
          onChange={(e) => set({ notes: e.target.value })}
        />
        {dictation.listening && (
          <p className="text-xs mt-2" style={{ color: 'var(--pitch-dark)' }}>
            <span className="cr-rec-dot" /> J’écoute…{' '}
            <span style={{ color: 'var(--ink-light)' }}>{dictation.interim}</span>
          </p>
        )}
        {dictation.error && (
          <p className="text-xs mt-2" style={{ color: 'var(--red)' }}>
            {dictation.error}
          </p>
        )}

        <div className="flex gap-2 flex-wrap mt-3">
          <button className="btn-primary" disabled={aiBusy} onClick={() => runAi(false)}>
            <Sparkles size={14} />
            {aiBusy === 'notes'
              ? 'Mise en forme…'
              : withContent
                ? 'Refaire à partir des notes'
                : 'Mettre en forme avec l’IA'}
          </button>
          {!withContent && (
            <button
              className="btn-secondary"
              disabled={aiBusy}
              onClick={() =>
                set({
                  content: { ...EMPTY_CONTENT, resume: cr.notes.trim() },
                })
              }
            >
              <Pencil size={14} />
              Rédiger moi-même
            </button>
          )}
        </div>
        {aiError && (
          <p className="text-xs mt-2" style={{ color: 'var(--red)' }}>
            {aiError}
          </p>
        )}
      </div>

      {withContent && (
        <div className="panel mt-4" style={{ padding: 16 }}>
          <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
            <h2 className="font-display text-lg">Compte rendu à relire</h2>
            <span className="text-xs" style={{ color: 'var(--ink-light)' }}>
              Tout est modifiable avant validation.
            </span>
          </div>

          <div className="cr-retouch mb-4">
            <input
              value={instruction}
              placeholder="Demander une retouche à l’IA (ex. plus court, ajoute que…)"
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && instruction.trim() && !aiBusy) runAi(true);
              }}
            />
            <button
              className="btn-secondary"
              disabled={aiBusy || !instruction.trim()}
              onClick={() => runAi(true)}
            >
              <Sparkles size={14} />
              {aiBusy === 'retouche' ? 'Retouche…' : 'Retoucher'}
            </button>
          </div>

          <ContentEditor content={cr.content} onChange={(content) => set({ content })} />
        </div>
      )}

      {error && (
        <p className="text-xs mt-3" style={{ color: 'var(--red)' }}>
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 mt-4 flex-wrap">
        <button className="btn-secondary" onClick={onCancel} disabled={busy}>
          Annuler
        </button>
        <button
          className="btn-secondary"
          disabled={busy || aiBusy}
          onClick={() => check() && onSave(cr)}
        >
          Enregistrer le brouillon
        </button>
        {withContent && (
          <button
            className="btn-primary"
            disabled={busy || aiBusy}
            onClick={() => {
              if (!check()) return;
              if (!hasContent(cr.content)) {
                setError('Le compte rendu est vide.');
                return;
              }
              onValidate(cr);
            }}
          >
            <Check size={14} />
            {busy ? 'Génération du PDF…' : 'Valider et créer le PDF'}
          </button>
        )}
      </div>
    </div>
  );
}

function CompteRenduView({ cr, pdfUrl, onBack, onEdit, onDelete }) {
  const c = cleanContent(cr.content);
  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        <button className="icon-btn" onClick={onBack} title="Retour">
          <ArrowLeft size={14} />
        </button>
        <h1 className="font-display text-2xl" style={{ flex: 1, minWidth: 0 }}>
          {cr.title}
        </h1>
        <StatusBadge cr={cr} />
      </div>
      <p className="text-sm mt-1" style={{ color: 'var(--ink-light)' }}>
        {[cr.meetingDate && capitalize(formatDateLong(cr.meetingDate)), cr.location]
          .filter(Boolean)
          .join(' · ')}
        {cr.participants ? ` · ${cr.participants}` : ''}
      </p>

      <div className="flex gap-2 flex-wrap mt-3">
        {pdfUrl && (
          <a className="btn-primary" href={pdfUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={14} />
            {cr.source === 'externe' ? 'Ouvrir le fichier' : 'Ouvrir le PDF'}
          </a>
        )}
        {cr.source === 'redige' && <ListenButton cr={cr} />}
        {cr.source === 'redige' && (
          <button className="btn-secondary" onClick={onEdit}>
            <Pencil size={14} />
            Modifier
          </button>
        )}
        <button className="btn-secondary" onClick={onDelete}>
          <Trash2 size={14} />
          Supprimer
        </button>
      </div>

      <div className="pitch-divider" />

      {cr.source === 'externe' ? (
        <div className="panel" style={{ padding: 16 }}>
          <p className="text-sm" style={{ color: 'var(--ink-light)' }}>
            Compte rendu déposé par {cr.createdBy || 'un membre'}
            {cr.createdAt ? ` le ${new Date(cr.createdAt).toLocaleDateString('fr-FR')}` : ''}.
          </p>
          {cr.notes && (
            <p className="text-sm mt-3" style={{ whiteSpace: 'pre-wrap' }}>
              {cr.notes}
            </p>
          )}
        </div>
      ) : (
        <div className="panel cr-read" style={{ padding: 16 }}>
          {c.resume && (
            <>
              <h3>Résumé</h3>
              <p>{c.resume}</p>
            </>
          )}
          {c.points.length > 0 && (
            <>
              <h3>Points abordés</h3>
              {c.points.map((p, i) => (
                <div key={i} className="cr-point">
                  <b>
                    {i + 1}. {p.titre}
                  </b>
                  <p>{p.contenu}</p>
                </div>
              ))}
            </>
          )}
          {c.decisions.length > 0 && (
            <>
              <h3>Décisions</h3>
              <ul>
                {c.decisions.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </>
          )}
          {c.actions.length > 0 && (
            <>
              <h3>Actions à mener</h3>
              <ul>
                {c.actions.map((a, i) => (
                  <li key={i}>
                    {a.action}
                    {(a.responsable || a.echeance) && (
                      <span style={{ color: 'var(--ink-light)' }}>
                        {' '}
                        · {[a.responsable, a.echeance].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
          {c.prochaine_reunion && (
            <>
              <h3>Prochaine réunion</h3>
              <p>{c.prochaine_reunion}</p>
            </>
          )}
          {cr.validatedBy && (
            <p className="text-xs mt-4" style={{ color: 'var(--ink-light)' }}>
              Validé par {cr.validatedBy}
              {cr.validatedAt ? ` le ${new Date(cr.validatedAt).toLocaleDateString('fr-FR')}` : ''}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function UploadModal({ onSubmit, onCancel }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function pick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_UPLOAD_SIZE) {
      setError('Le fichier dépasse 50 Mo.');
      return;
    }
    setError('');
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '));
  }

  async function submit() {
    if (!file) return setError('Choisis un fichier.');
    if (!title.trim()) return setError('Le titre est obligatoire.');
    setBusy(true);
    const ok = await onSubmit({ file, title: title.trim(), meetingDate, notes: notes.trim() });
    if (!ok) setBusy(false);
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          className="icon-btn"
          style={{ position: 'absolute', top: 14, right: 14 }}
          onClick={onCancel}
        >
          <X size={14} />
        </button>
        <h3 className="font-display text-lg">Déposer un compte rendu</h3>
        <p className="text-xs mt-1" style={{ color: 'var(--ink-light)' }}>
          Compte rendu d’une autre réunion (ligue, comité, mairie, autre club…).
        </p>
        <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Fichier (PDF, Word, photo… 50 Mo max)">
            <input type="file" onChange={pick} />
          </Field>
          <Field label="Titre">
            <input
              value={title}
              placeholder="Ex. AG du comité départemental"
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="Date de la réunion">
            <input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
          </Field>
          <Field label="Note (facultatif)">
            <textarea
              rows={3}
              value={notes}
              placeholder="Ce qu’il faut en retenir"
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
          {error && (
            <p className="text-xs" style={{ color: 'var(--red)' }}>
              {error}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-secondary" onClick={onCancel}>
            Annuler
          </button>
          <button className="btn-primary" onClick={submit} disabled={busy}>
            {busy ? 'Envoi…' : 'Déposer'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Section principale
--------------------------------------------------------- */

export default function ComptesRendusSection({
  supabase,
  session,
  showToast,
  docFolders,
  documents,
  uploadDocumentFile,
  getDocumentUrl,
  onDocumentsChanged,
  setConfirmState,
}) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(true);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState({ view: 'list' });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  async function load() {
    const { data, error } = await supabase
      .from('comptes_rendus')
      .select('*')
      .order('meeting_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      console.error(error);
      setReady(false);
      return [];
    }
    setReady(true);
    const mapped = (data || []).map(mapRow);
    setItems(mapped);
    return mapped;
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const docById = useMemo(() => new Map(documents.map((d) => [d.id, d])), [documents]);

  function pdfUrlOf(cr) {
    const doc = cr.documentId && docById.get(cr.documentId);
    return doc ? getDocumentUrl(doc) : null;
  }

  async function ensureFolder() {
    const existing = docFolders.find(
      (f) => f.name.trim().toLowerCase() === CR_FOLDER_NAME.toLowerCase()
    );
    if (existing) return existing.id;
    const id = newId();
    const { error } = await supabase
      .from('doc_folders')
      .insert({ id, name: CR_FOLDER_NAME, created_by: session.displayName });
    if (error) throw error;
    return id;
  }

  async function removeDocument(documentId) {
    const doc = documentId && docById.get(documentId);
    if (!doc) return;
    await supabase.storage.from('documents').remove([doc.storagePath]);
    await supabase.from('documents').delete().eq('id', doc.id);
  }

  function toRow(cr) {
    return {
      title: cr.title.trim(),
      meeting_date: cr.meetingDate || null,
      location: cr.location.trim(),
      participants: cr.participants.trim(),
      notes: cr.notes,
      content: cr.content ? cleanContent(cr.content) : null,
      updated_at: new Date().toISOString(),
    };
  }

  async function upsert(cr, extra = {}) {
    const row = { ...toRow(cr), ...extra };
    if (cr.isNew) {
      const { error } = await supabase.from('comptes_rendus').insert({
        id: cr.id,
        source: 'redige',
        created_by: session.displayName,
        ...row,
      });
      if (error) throw error;
    } else {
      const { error } = await supabase.from('comptes_rendus').update(row).eq('id', cr.id);
      if (error) throw error;
    }
  }

  async function saveDraft(cr) {
    setBusy(true);
    try {
      // Un compte rendu validé qu'on modifie repasse en brouillon : son
      // PDF sera remplacé à la prochaine validation.
      await upsert(cr, { status: 'brouillon' });
      await load();
      setMode({ view: 'list' });
      showToast('Brouillon enregistré.');
    } catch (e) {
      console.error(e);
      showToast("Impossible d'enregistrer le compte rendu.");
    } finally {
      setBusy(false);
    }
  }

  async function validate(cr) {
    setBusy(true);
    try {
      const validatedAt = new Date().toISOString();
      const finalCr = {
        ...cr,
        content: cleanContent(cr.content),
        validatedBy: session.displayName,
        validatedAt,
      };
      const logo = await loadUsbLogo();
      const pdf = buildCompteRenduPdf(finalCr, logo);
      const fileName = `CR_${cr.meetingDate || todayIso()}_${fileSafe(cr.title)}.pdf`;
      const file = new File([pdf.output('blob')], fileName, { type: 'application/pdf' });
      const folderId = await ensureFolder();
      const docId = await uploadDocumentFile({
        file,
        name: fileName,
        folderId,
        projectId: null,
        taskId: null,
      });
      const previousDoc = cr.isNew ? null : cr.documentId;
      await upsert(finalCr, {
        status: 'valide',
        document_id: docId,
        validated_by: session.displayName,
        validated_at: validatedAt,
      });
      if (previousDoc && previousDoc !== docId) {
        await removeDocument(previousDoc).catch(console.error);
      }
      await onDocumentsChanged();
      const fresh = await load();
      const saved = fresh.find((x) => x.id === cr.id);
      setMode(saved ? { view: 'read', id: saved.id } : { view: 'list' });
      showToast('Compte rendu validé : PDF rangé dans Documents › Comptes rendus.');
    } catch (e) {
      console.error(e);
      showToast('Impossible de valider le compte rendu.');
    } finally {
      setBusy(false);
    }
  }

  async function uploadExternal({ file, title, meetingDate, notes }) {
    try {
      const folderId = await ensureFolder();
      const docId = await uploadDocumentFile({
        file,
        name: file.name,
        folderId,
        projectId: null,
        taskId: null,
      });
      const { error } = await supabase.from('comptes_rendus').insert({
        id: newId(),
        source: 'externe',
        status: 'valide',
        title,
        meeting_date: meetingDate || null,
        notes,
        document_id: docId,
        created_by: session.displayName,
      });
      if (error) throw error;
      await onDocumentsChanged();
      await load();
      setShowUpload(false);
      showToast('Compte rendu déposé.');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Impossible de déposer le compte rendu.');
      return false;
    }
  }

  function askDelete(cr) {
    setConfirmState({
      message: `Supprimer le compte rendu « ${cr.title} » et son fichier ?`,
      onConfirm: async () => {
        try {
          await removeDocument(cr.documentId);
          const { error } = await supabase.from('comptes_rendus').delete().eq('id', cr.id);
          if (error) throw error;
          await onDocumentsChanged();
          await load();
          setMode({ view: 'list' });
          showToast('Compte rendu supprimé.');
        } catch (e) {
          console.error(e);
          showToast('Impossible de supprimer le compte rendu.');
        }
        setConfirmState(null);
      },
    });
  }

  function startNew() {
    setMode({
      view: 'edit',
      cr: {
        id: newId(),
        isNew: true,
        source: 'redige',
        status: 'brouillon',
        title: '',
        meetingDate: todayIso(),
        location: '',
        participants: '',
        notes: '',
        content: null,
        documentId: null,
      },
    });
  }

  if (!ready) {
    return (
      <div>
        <h1 className="font-display text-2xl">Comptes rendus</h1>
        <div className="pitch-divider" />
        <div className="panel" style={{ padding: 16 }}>
          <p className="text-sm">
            La section n’est pas encore activée : la table <code>comptes_rendus</code> doit être
            créée dans Supabase (fichier <code>supabase/comptes-rendus.sql</code>).
          </p>
        </div>
      </div>
    );
  }

  if (mode.view === 'edit') {
    return (
      <CompteRenduEditor
        key={mode.cr.id}
        initial={mode.cr}
        busy={busy}
        onSave={saveDraft}
        onValidate={validate}
        onCancel={() => setMode({ view: 'list' })}
      />
    );
  }

  if (mode.view === 'read') {
    const cr = items.find((x) => x.id === mode.id);
    if (cr) {
      return (
        <CompteRenduView
          cr={cr}
          pdfUrl={pdfUrlOf(cr)}
          onBack={() => setMode({ view: 'list' })}
          onEdit={() => setMode({ view: 'edit', cr: { ...cr } })}
          onDelete={() => askDelete(cr)}
        />
      );
    }
  }

  const q = search.trim().toLowerCase();
  const visible = items.filter((cr) => {
    if (filter === 'redige' && cr.source !== 'redige') return false;
    if (filter === 'externe' && cr.source !== 'externe') return false;
    if (filter === 'brouillon' && !(cr.source === 'redige' && cr.status === 'brouillon')) return false;
    if (!q) return true;
    return [cr.title, cr.location, cr.participants, cr.notes, cr.content?.resume]
      .filter(Boolean)
      .some((s) => s.toLowerCase().includes(q));
  });

  const drafts = items.filter((cr) => cr.source === 'redige' && cr.status === 'brouillon').length;

  const FILTERS = [
    ['all', 'Tous'],
    ['redige', 'Rédigés'],
    ['externe', 'Déposés'],
    ['brouillon', `Brouillons${drafts ? ` (${drafts})` : ''}`],
  ];

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-display text-2xl">Comptes rendus</h1>
        <div className="flex gap-2 flex-wrap">
          <button className="btn-secondary" onClick={() => setShowUpload(true)}>
            <Upload size={14} />
            Déposer
          </button>
          <button className="btn-primary" onClick={startNew}>
            <Plus size={14} />
            Nouveau compte rendu
          </button>
        </div>
      </div>

      <div className="pitch-divider" />

      <div className="flex gap-2 flex-wrap mb-3">
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--ink-light)',
            }}
          />
          <input
            style={{ paddingLeft: 32 }}
            placeholder="Rechercher un compte rendu…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map(([id, label]) => (
          <button
            key={id}
            className="pill"
            style={{
              background: filter === id ? 'var(--pitch-dark)' : 'var(--chalk)',
              color: filter === id ? 'var(--on-pitch)' : 'var(--ink)',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--ink-light)' }}>
          Chargement…
        </p>
      ) : visible.length === 0 ? (
        <div className="panel" style={{ padding: 20, textAlign: 'center' }}>
          <ScrollText size={22} style={{ margin: '0 auto', color: 'var(--ink-light)' }} />
          <p className="text-sm mt-2" style={{ color: 'var(--ink-light)' }}>
            {items.length === 0
              ? 'Aucun compte rendu pour l’instant. Crée le premier en écrivant ou en dictant tes notes de réunion.'
              : 'Aucun compte rendu ne correspond.'}
          </p>
        </div>
      ) : (
        <div>
          {visible.map((cr) => {
            const url = pdfUrlOf(cr);
            const isDraft = cr.source === 'redige' && cr.status === 'brouillon';
            return (
              <div
                key={cr.id}
                className="flex items-center gap-3 py-2"
                style={{ borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                onClick={() =>
                  setMode(isDraft ? { view: 'edit', cr: { ...cr } } : { view: 'read', id: cr.id })
                }
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: 'var(--chalk)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {cr.source === 'externe' ? <FileUp size={16} /> : <ScrollText size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{cr.title}</p>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span className="text-xs" style={{ color: 'var(--ink-light)' }}>
                      {formatDateShort(cr.meetingDate)}
                      {cr.createdBy ? ` · ${cr.createdBy}` : ''}
                    </span>
                    <StatusBadge cr={cr} />
                  </div>
                </div>
                {url && (
                  <a
                    className="icon-btn"
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    title="Ouvrir le PDF"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
                <button
                  className="icon-btn"
                  title="Supprimer"
                  onClick={(e) => {
                    e.stopPropagation();
                    askDelete(cr);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showUpload && (
        <UploadModal onSubmit={uploadExternal} onCancel={() => setShowUpload(false)} />
      )}
    </div>
  );
}
