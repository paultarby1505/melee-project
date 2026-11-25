import Anthropic from '@anthropic-ai/sdk';

/*
  Fonction Vercel : met en forme un compte rendu de réunion avec Claude.

  POST /api/compte-rendu
  {
    notes: string,            // notes brutes saisies ou dictées
    title?, meetingDate?, location?, participants?,
    current?: object,         // version déjà retravaillée (pour une retouche)
    instruction?: string      // consigne de retouche (« plus court », …)
  }
  → { content: { resume, points, decisions, actions, prochaine_reunion } }

  La clé ANTHROPIC_API_KEY doit être ajoutée dans les réglages Vercel du
  projet melee-project.
*/

const MODEL = 'claude-opus-5-5';
const MAX_NOTES = 60000;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['resume', 'points', 'decisions', 'actions', 'prochaine_reunion'],
  properties: {
    resume: { type: 'string' },
    points: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['titre', 'contenu'],
        properties: {
          titre: { type: 'string' },
          contenu: { type: 'string' },
        },
      },
    },
    decisions: { type: 'array', items: { type: 'string' } },
    actions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['action', 'responsable', 'echeance'],
        properties: {
          action: { type: 'string' },
          responsable: { type: 'string' },
          echeance: { type: 'string' },
        },
      },
    },
    prochaine_reunion: { type: 'string' },
  },
};

const SYSTEM = `Tu es le secrétaire de séance de l'US Baumoise Rugby (club amateur, école de rugby, entente avec d'autres clubs). On te donne les notes brutes d'une réunion, écrites vite ou dictées à voix haute (donc avec des fautes, des répétitions, des hésitations et des mots mal reconnus), et tu rédiges un compte rendu propre en français.

Règles :
- "resume" : 3 à 5 phrases qui disent l'essentiel de la réunion.
- "points" : les sujets abordés, dans l'ordre de la réunion, chacun avec un titre court et un paragraphe clair et neutre (pas de liste à puces dans "contenu", des phrases).
- "decisions" : les décisions prises, une phrase par décision. Tableau vide s'il n'y en a pas.
- "actions" : ce que quelqu'un doit faire. "responsable" = la personne ou le groupe nommé, sinon "". "echeance" = la date ou le délai tel qu'indiqué, sinon "".
- "prochaine_reunion" : date, heure ou lieu de la prochaine réunion s'ils sont donnés, sinon "".
- Corrige l'orthographe et les mots mal reconnus par la dictée quand le sens est évident (noms de clubs, catégories U6 à U19, termes de rugby).
- N'invente rien : pas de chiffre, de nom, de date ni de décision qui ne figure pas dans les notes.
- Ton sobre et factuel, à la troisième personne, sans formule de politesse.`;

function clean(v, max = 500) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function contextLines(body) {
  return [
    clean(body.title) && `Titre : ${clean(body.title)}`,
    clean(body.meetingDate, 40) && `Date : ${clean(body.meetingDate, 40)}`,
    clean(body.location) && `Lieu : ${clean(body.location)}`,
    clean(body.participants, 2000) &&
      `Participants : ${clean(body.participants, 2000)}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({
      error:
        "L'assistant IA n'est pas encore activé : il faut ajouter la clé ANTHROPIC_API_KEY dans les réglages Vercel de Mêlée.",
      code: 'no_key',
    });
  }

  const body =
    typeof req.body === 'string' ? safeJson(req.body) : req.body || {};
  const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
  const instruction = clean(body.instruction, 2000);
  const current =
    body.current && typeof body.current === 'object' ? body.current : null;

  if (!notes && !current) {
    return res
      .status(400)
      .json({ error: 'Écris ou dicte d’abord le contenu de la réunion.' });
  }
  if (notes.length > MAX_NOTES) {
    return res.status(413).json({
      error: 'Les notes sont trop longues (60 000 caractères maximum).',
    });
  }

  const parts = [];
  const ctx = contextLines(body);
  if (ctx) parts.push(`Informations sur la réunion :\n${ctx}`);
  if (notes) parts.push(`Notes brutes de la réunion :\n<notes>\n${notes}\n</notes>`);
  if (current) {
    parts.push(
      `Version actuelle du compte rendu (JSON) :\n${JSON.stringify(current).slice(0, MAX_NOTES)}`
    );
    parts.push(
      `Retravaille cette version en suivant la consigne suivante, sans perdre d'information utile : ${
        instruction || 'améliore la clarté et la rédaction.'
      }`
    );
  } else {
    parts.push('Rédige le compte rendu de cette réunion.');
    if (instruction) parts.push(`Consigne supplémentaire : ${instruction}`);
  }

  const client = new Anthropic();

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: {
        effort: 'low',
        format: { type: 'json_schema', schema: SCHEMA },
      },
      system: SYSTEM,
      messages: [{ role: 'user', content: parts.join('\n\n') }],
    });

    if (response.stop_reason === 'refusal') {
      return res.status(422).json({
        error: "L'IA n'a pas pu traiter ce texte. Reformule ou raccourcis les notes.",
      });
    }
    if (response.stop_reason === 'max_tokens') {
      return res.status(422).json({
        error: 'Le compte rendu est trop long pour être généré en une fois.',
      });
    }

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');
    const content = safeJson(text);
    if (!content) {
      return res
        .status(502)
        .json({ error: "Réponse de l'IA illisible, réessaie." });
    }
    return res.status(200).json({ content });
  } catch (error) {
    console.error(error);
    if (error instanceof Anthropic.AuthenticationError) {
      return res.status(503).json({
        error: 'La clé ANTHROPIC_API_KEY configurée sur Vercel est refusée.',
        code: 'no_key',
      });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return res
        .status(429)
        .json({ error: "L'IA est très sollicitée, réessaie dans une minute." });
    }
    return res
      .status(502)
      .json({ error: "L'IA est indisponible pour le moment, réessaie." });
  }
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
