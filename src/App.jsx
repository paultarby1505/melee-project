import React, { useEffect, useMemo, useState } from 'react';
import {
  Home as HomeIcon,
  FolderKanban,
  CalendarDays,
  MessageSquare,
  FileText,
  Dumbbell,
  X,
  Plus,
  Pencil,
  Trash2,
  Check,
  Clock,
  AlertTriangle,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  Calendar,
  List,
  Shield,
  UserPlus,
  KeyRound,
  LogOut,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL = 'https://gfrfzhwpzocklqycdpxy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ahTXHPST4iPLQhlvRSfHMg_gvU5UjuK';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* =========================================================
   CONSTANTES
========================================================= */

const MONTHS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const DAYS_FULL_FR = [
  'dimanche',
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
];

const PROJECT_COLORS = [
  '#2D6A4F',
  '#B08968',
  '#3D5A80',
  '#B23A30',
  '#8A6BAE',
  '#C98A2C',
];

const MEMBER_COLORS = [
  '#3D5A80',
  '#8A6BAE',
  '#2D6A4F',
  '#B08968',
  '#C98A2C',
  '#5C6B73',
  '#A64B2A',
  '#6B8F71',
];

const STATUS_ORDER = ['a_venir', 'en_cours', 'termine'];

const STATUS_META = {
  a_venir: {
    label: 'À venir',
    bg: 'var(--tan-tint)',
    color: 'var(--tan-text)',
  },
  en_cours: {
    label: 'En cours',
    bg: 'var(--pitch-tint)',
    color: 'var(--pitch-dark)',
  },
  termine: {
    label: 'Terminé',
    bg: '#E7E9E6',
    color: '#55605A',
  },
};

const TABS = [
  { id: 'home', label: 'Accueil', icon: HomeIcon },
  { id: 'projects', label: 'Projets', icon: FolderKanban },
  { id: 'planning', label: 'Planning', icon: CalendarDays },
  { id: 'cycles', label: 'Cycles rugby', icon: Dumbbell, stub: true },
  { id: 'chat', label: 'Chat', icon: MessageSquare, stub: true },
  { id: 'docs', label: 'Documents', icon: FileText, stub: true },
];

const STUB_CONTENT = {
  cycles: {
    icon: Dumbbell,
    title: 'Cycles rugby',
    description:
      "La gestion des cycles d'entraînement arrivera dans une prochaine itération.",
  },
  chat: {
    icon: MessageSquare,
    title: "Chat d'équipe",
    description:
      "La messagerie entre membres de l'équipe arrivera dans une prochaine itération.",
  },
  docs: {
    icon: FileText,
    title: 'Documents',
    description:
      'Le dépôt de documents et de liens partagés arrivera dans une prochaine itération.',
  },
};

/* =========================================================
   OUTILS
========================================================= */

function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return (
    'id-' +
    Date.now() +
    '-' +
    Math.random().toString(36).slice(2, 9)
  );
}

function generatePassword(length = 10) {
  const chars =
    'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

async function hashPassword(username, password) {
  const encoder = new TextEncoder();

  const data = encoder.encode(
    `${username.toLowerCase()}::${password}`
  );

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function todayISO() {
  const d = new Date();

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(iso) {
  const [y, m, d] = iso.split('-').map(Number);

  const target = new Date(y, m - 1, d);

  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  return Math.round((target - today) / 86400000);
}

function formatDateFR(iso) {
  if (!iso) return '';

  const [y, m, d] = iso.split('-').map(Number);

  return `${d} ${MONTHS_FR[m - 1]}`;
}

function formatTime(date) {
  if (!date) return '';

  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
}

function formatRange(start, end) {
  if (!start && !end) return 'Dates libres';
  if (start && !end) return `À partir du ${formatDateFR(start)}`;
  if (!start && end) return `Jusqu'au ${formatDateFR(end)}`;

  return `${formatDateFR(start)} → ${formatDateFR(end)}`;
}

function getMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1);

  const startOffset = (firstDay.getDay() + 6) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const totalCells =
    Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const cells = [];

  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1;

    const d = new Date(year, month, dayNum);

    const iso = `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    cells.push({
      day: d.getDate(),
      iso,
      currentMonth: d.getMonth() === month,
    });
  }

  return cells;
}

function getWeekDays(anchorDate) {
  const offset = (anchorDate.getDay() + 6) % 7;

  const monday = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth(),
    anchorDate.getDate() - offset
  );

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + i
    );

    const iso = `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    return { date: d, iso };
  });
}

/* =========================================================
   PETITS COMPOSANTS
========================================================= */

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.a_venir;

  return (
    <span
      className="pill"
      style={{
        background: meta.bg,
        color: meta.color,
      }}
    >
      {meta.label}
    </span>
  );
}

function PasswordField({
  value,
  onChange,
  placeholder,
  autoFocus,
  onKeyDown,
}) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
        style={{ paddingRight: '38px' }}
      />

      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        style={{
          position: 'absolute',
          right: 6,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--ink-light)',
          padding: 4,
        }}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function TaskStatusIcon({ status }) {
  if (status === 'termine') return <Check size={14} />;
  if (status === 'en_cours') return <Loader2 size={14} />;

  return <Clock size={14} />;
}

function TaskRow({ task, onToggleStatus, onDelete }) {
  const overdue =
    task.status !== 'termine' &&
    task.dueDate &&
    daysBetween(task.dueDate) < 0;

  const soon =
    task.status !== 'termine' &&
    task.dueDate &&
    daysBetween(task.dueDate) >= 0 &&
    daysBetween(task.dueDate) <= 3;

  return (
    <div
      className="flex items-center gap-3 py-2"
      style={{ borderBottom: '1px solid var(--line)' }}
    >
      <button
        className="icon-btn"
        onClick={() => onToggleStatus(task)}
      >
        <TaskStatusIcon status={task.status} />
      </button>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{
            textDecoration:
              task.status === 'termine'
                ? 'line-through'
                : 'none',
            color:
              task.status === 'termine'
                ? 'var(--ink-light)'
                : 'var(--ink)',
          }}
        >
          {task.title}
        </p>

        <div className="flex items-center gap-2 flex-wrap mt-1">
          {task.assignee && (
            <span
              className="text-xs flex items-center gap-1"
              style={{ color: 'var(--ink-light)' }}
            >
              <User size={11} />
              {task.assignee}
            </span>
          )}

          {task.dueDate && (
            <span
              className="text-xs"
              style={{
                color: overdue
                  ? 'var(--red)'
                  : soon
                  ? 'var(--amber)'
                  : 'var(--ink-light)',
              }}
            >
              {formatDateFR(task.dueDate)}
            </span>
          )}

          {overdue && (
            <span
              className="pill"
              style={{
                background: 'var(--red-tint)',
                color: 'var(--red)',
              }}
            >
              <AlertOctagon size={10} />
              En retard
            </span>
          )}

          {soon && (
            <span
              className="pill"
              style={{
                background: 'var(--amber-tint)',
                color: 'var(--amber)',
              }}
            >
              <AlertTriangle size={10} />
              Bientôt
            </span>
          )}
        </div>
      </div>

      <button
        className="icon-btn"
        onClick={() => onDelete(task.id)}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function ProjectCard({ project, tasks, onClick }) {
  const projectTasks = tasks.filter(
    (task) => task.projectId === project.id
  );

  const done = projectTasks.filter(
    (task) => task.status === 'termine'
  ).length;

  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        borderTop: `4px solid ${project.color}`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-lg">
          {project.name}
        </h3>

        <StatusPill status={project.status} />
      </div>

      {project.description && (
        <p
          className="text-sm mt-1"
          style={{
            color: 'var(--ink-light)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {project.description}
        </p>
      )}

      <div className="flex items-end justify-between mt-4">
        <span
          className="text-xs"
          style={{ color: 'var(--ink-light)' }}
        >
          {formatRange(
            project.startDate,
            project.endDate
          )}
        </span>

        <span
          className="score"
          style={{ color: 'var(--pitch-dark)' }}
        >
          {done}
          <span
            style={{
              color: 'var(--ink-light)',
              fontWeight: 400,
            }}
          >
            {' '}
            / {projectTasks.length}
          </span>
        </span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, danger }) {
  const alert = danger && value > 0;

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold uppercase"
          style={{
            color: 'var(--ink-light)',
            letterSpacing: '0.03em',
          }}
        >
          {label}
        </span>

        <Icon
          size={16}
          style={{
            color: alert
              ? 'var(--red)'
              : 'var(--pitch)',
          }}
        />
      </div>

      <p
        className="score mt-1"
        style={{
          color: alert ? 'var(--red)' : 'var(--ink)',
          fontSize: '28px',
        }}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   MODALES
========================================================= */

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="icon-btn"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
          }}
          onClick={onCancel}
        >
          <X size={14} />
        </button>

        <h3 className="font-display text-lg">
          {title}
        </h3>

        <p
          className="text-sm mt-2"
          style={{ color: 'var(--ink-light)' }}
        >
          {message}
        </p>

        <div className="flex justify-end gap-2 mt-5">
          <button
            className="btn-secondary"
            onClick={onCancel}
          >
            Annuler
          </button>

          <button
            className="btn-primary"
            style={{ background: 'var(--red)' }}
            onClick={onConfirm}
          >
            {confirmLabel || 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectFormModal({
  initial,
  onSubmit,
  onCancel,
}) {
  const [name, setName] = useState(
    initial?.name || ''
  );

  const [description, setDescription] = useState(
    initial?.description || ''
  );

  const [startDate, setStartDate] = useState(
    initial?.startDate || ''
  );

  const [endDate, setEndDate] = useState(
    initial?.endDate || ''
  );

  const [status, setStatus] = useState(
    initial?.status || 'a_venir'
  );

  const [error, setError] = useState('');

  function submit() {
    if (!name.trim()) {
      setError('Le nom est obligatoire.');
      return;
    }

    if (
      startDate &&
      endDate &&
      endDate < startDate
    ) {
      setError(
        'La date de fin doit être après la date de début.'
      );
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      startDate,
      endDate,
      status,
    });
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="icon-btn"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
          }}
          onClick={onCancel}
        >
          <X size={14} />
        </button>

        <h3 className="font-display text-lg">
          {initial
            ? 'Modifier le projet'
            : 'Nouveau projet'}
        </h3>

        <div
          className="mt-4"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div>
            <label>Nom du projet</label>

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              autoFocus
              placeholder="Ex. Tournoi des jeunes"
            />
          </div>

          <div>
            <label>Description</label>

            <textarea
              rows={3}
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label>Début</label>

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
              />
            </div>

            <div>
              <label>Fin</label>

              <input
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
              />
            </div>
          </div>

          <div>
            <label>Statut</label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
            >
              <option value="a_venir">
                À venir
              </option>

              <option value="en_cours">
                En cours
              </option>

              <option value="termine">
                Terminé
              </option>
            </select>
          </div>

          {error && (
            <p
              className="text-xs"
              style={{ color: 'var(--red)' }}
            >
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            className="btn-secondary"
            onClick={onCancel}
          >
            Annuler
          </button>

          <button
            className="btn-primary"
            onClick={submit}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskQuickAddForm({
  defaultAssignee,
  users,
  onAdd,
}) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [assignee, setAssignee] =
    useState(defaultAssignee || '');

  function submit() {
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      dueDate,
      assignee:
        assignee || defaultAssignee,
    });

    setTitle('');
    setDueDate('');
  }

  return (
    <div
      className="flex flex-col sm:flex-row gap-2 mt-3"
      style={{
        paddingTop: 12,
        borderTop: '1px dashed var(--line)',
      }}
    >
      <input
        style={{ flex: 2 }}
        placeholder="Ajouter une tâche…"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        onKeyDown={(e) =>
          e.key === 'Enter' && submit()
        }
      />

      <input
        type="date"
        style={{ flex: 1 }}
        value={dueDate}
        onChange={(e) =>
          setDueDate(e.target.value)
        }
      />

      <select
        style={{ flex: 1 }}
        value={assignee}
        onChange={(e) =>
          setAssignee(e.target.value)
        }
      >
        {users.map((user) => (
          <option
            key={user.username}
            value={user.displayName}
          >
            {user.displayName}
          </option>
        ))}
      </select>

      <button
        className="btn-primary"
        onClick={submit}
      >
        <Plus size={14} />
        Ajouter
      </button>
    </div>
  );
}

function EventFormModal({
  initialDate,
  users,
  defaultAssignee,
  onSubmit,
  onCancel,
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(
    initialDate || todayISO()
  );
  const [time, setTime] = useState('');
  const [assignee, setAssignee] = useState(
    defaultAssignee || ''
  );
  const [error, setError] = useState('');

  function submit() {
    if (!title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }

    if (!date) {
      setError('La date est obligatoire.');
      return;
    }

    onSubmit({
      title: title.trim(),
      date,
      time,
      assignee: assignee || defaultAssignee,
    });
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="icon-btn"
          style={{ position: 'absolute', top: 14, right: 14 }}
          onClick={onCancel}
        >
          <X size={14} />
        </button>

        <h3 className="font-display text-lg">
          Nouvel événement
        </h3>

        <div
          className="mt-4"
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div>
            <label>Titre</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              placeholder="Ex. RDV avec le sponsor"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label>Heure</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label>Assigné à</label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            >
              {users.map((user) => (
                <option
                  key={user.username}
                  value={user.displayName}
                >
                  {user.displayName}
                </option>
              ))}
            </select>
          </div>

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

          <button className="btn-primary" onClick={submit}>
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}

function UserFormModal({ existingUsernames, onCreate, onCancel }) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('membre');
  const [password, setPassword] = useState(() => generatePassword());
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  async function copyPassword(value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // presse-papier indisponible : rien à faire
    }
  }

  async function submit() {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError("L'identifiant est obligatoire.");
      return;
    }

    if (
      existingUsernames.some(
        (u) => u.toLowerCase() === trimmedUsername.toLowerCase()
      )
    ) {
      setError('Cet identifiant existe déjà.');
      return;
    }

    setBusy(true);
    setError('');

    const ok = await onCreate({
      username: trimmedUsername,
      displayName: displayName.trim() || trimmedUsername,
      password,
      role,
    });

    setBusy(false);

    if (ok) {
      setCreated({ username: trimmedUsername, password });
    } else {
      setError('La création du compte a échoué.');
    }
  }

  if (created) {
    return (
      <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-display text-lg">Membre créé</h3>

          <p className="text-sm mt-2" style={{ color: 'var(--ink-light)' }}>
            Transmets ces identifiants à {created.username}. Le mot de passe
            ne sera plus affiché ensuite.
          </p>

          <div
            className="mt-4"
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <div>
              <label>Identifiant</label>
              <input value={created.username} readOnly />
            </div>

            <div>
              <label>Mot de passe</label>
              <div className="flex gap-2">
                <input
                  value={created.password}
                  readOnly
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => copyPassword(created.password)}
                >
                  <Copy size={14} />
                </button>
              </div>
              {copied && (
                <p className="text-xs mt-1" style={{ color: 'var(--pitch)' }}>
                  Copié !
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <button className="btn-primary" onClick={onCancel}>
              Terminé
            </button>
          </div>
        </div>
      </div>
    );
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

        <h3 className="font-display text-lg">Nouveau membre</h3>

        <div
          className="mt-4"
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div>
            <label>Identifiant</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              placeholder="Ex. julie"
            />
          </div>

          <div>
            <label>Nom affiché</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ex. Julie"
            />
          </div>

          <div>
            <label>Rôle</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="membre">Membre</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label>Mot de passe généré</label>
            <div className="flex gap-2">
              <input value={password} readOnly style={{ flex: 1 }} />
              <button
                type="button"
                className="icon-btn"
                onClick={() => setPassword(generatePassword())}
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

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
            {busy ? 'Création…' : 'Créer le membre'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordModal({ user, onConfirm, onCancel }) {
  const [password, setPassword] = useState(() => generatePassword());
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // presse-papier indisponible : rien à faire
    }
  }

  async function confirm() {
    setBusy(true);
    await onConfirm(password);
    setBusy(false);
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

        <h3 className="font-display text-lg">
          Réinitialiser le mot de passe
        </h3>

        <p className="text-sm mt-2" style={{ color: 'var(--ink-light)' }}>
          Nouveau mot de passe pour {user.displayName}. Transmets-le avant de
          fermer cette fenêtre.
        </p>

        <div className="mt-4">
          <label>Mot de passe</label>
          <div className="flex gap-2">
            <input value={password} readOnly style={{ flex: 1 }} />
            <button
              type="button"
              className="icon-btn"
              onClick={() => setPassword(generatePassword())}
            >
              <RefreshCw size={14} />
            </button>
            <button type="button" className="icon-btn" onClick={copyPassword}>
              <Copy size={14} />
            </button>
          </div>
          {copied && (
            <p className="text-xs mt-1" style={{ color: 'var(--pitch)' }}>
              Copié !
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-secondary" onClick={onCancel}>
            Annuler
          </button>

          <button className="btn-primary" onClick={confirm} disabled={busy}>
            {busy ? 'Application…' : 'Confirmer la réinitialisation'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   AUTH
========================================================= */

function BootstrapAdminForm({
  onCreate,
  busy,
}) {
  const [username, setUsername] =
    useState('');

  const [displayName, setDisplayName] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [confirm, setConfirm] =
    useState('');

  const [error, setError] =
    useState('');

  function submit() {
    if (!username.trim()) {
      setError('Choisis un identifiant.');
      return;
    }

    if (password.length < 4) {
      setError(
        'Le mot de passe doit faire au moins 4 caractères.'
      );
      return;
    }

    if (password !== confirm) {
      setError(
        'Les deux mots de passe ne correspondent pas.'
      );
      return;
    }

    onCreate({
      username: username.trim(),
      displayName:
        displayName.trim() ||
        username.trim(),
      password,
    });
  }

  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: '65vh' }}
    >
      <div
        className="modal-card"
        style={{
          maxWidth: 380,
          width: '100%',
        }}
      >
        <h2 className="font-display text-xl">
          Bienvenue dans Mêlée
        </h2>

        <p
          className="text-sm mt-1"
          style={{ color: 'var(--ink-light)' }}
        >
          Crée le compte administrateur pour
          démarrer l'espace de ton équipe.
        </p>

        <div
          className="mt-4"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div>
            <label>Identifiant</label>

            <input
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              autoFocus
              placeholder="Ex. paul"
            />
          </div>

          <div>
            <label>Nom affiché</label>

            <input
              value={displayName}
              onChange={(e) =>
                setDisplayName(e.target.value)
              }
              placeholder="Ex. Paul"
            />
          </div>

          <div>
            <label>Mot de passe</label>

            <PasswordField
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />
          </div>

          <div>
            <label>Confirmer</label>

            <PasswordField
              value={confirm}
              onChange={(e) =>
                setConfirm(e.target.value)
              }
              onKeyDown={(e) =>
                e.key === 'Enter' && submit()
              }
            />
          </div>

          {error && (
            <p
              className="text-xs"
              style={{ color: 'var(--red)' }}
            >
              {error}
            </p>
          )}
        </div>

        <button
          className="btn-primary"
          style={{
            width: '100%',
            marginTop: 18,
          }}
          onClick={submit}
          disabled={busy}
        >
          {busy
            ? 'Création…'
            : 'Créer le compte et démarrer'}
        </button>
      </div>
    </div>
  );
}

function LoginForm({
  onLogin,
  busy,
  error,
}) {
  const [username, setUsername] =
    useState('');

  const [password, setPassword] =
    useState('');

  function submit() {
    if (!username.trim() || !password)
      return;

    onLogin(username.trim(), password);
  }

  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: '65vh' }}
    >
      <div
        className="modal-card"
        style={{
          maxWidth: 360,
          width: '100%',
        }}
      >
        <h2 className="font-display text-xl">
          Connexion
        </h2>

        <p
          className="text-sm mt-1"
          style={{ color: 'var(--ink-light)' }}
        >
          Entre tes identifiants pour rejoindre
          l'espace de l'équipe.
        </p>

        <div
          className="mt-4"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div>
            <label>Identifiant</label>

            <input
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              autoFocus
              onKeyDown={(e) =>
                e.key === 'Enter' && submit()
              }
            />
          </div>

          <div>
            <label>Mot de passe</label>

            <PasswordField
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              onKeyDown={(e) =>
                e.key === 'Enter' && submit()
              }
            />
          </div>

          {error && (
            <p
              className="text-xs"
              style={{ color: 'var(--red)' }}
            >
              {error}
            </p>
          )}
        </div>

        <button
          className="btn-primary"
          style={{
            width: '100%',
            marginTop: 18,
          }}
          onClick={submit}
          disabled={busy}
        >
          {busy
            ? 'Connexion…'
            : 'Se connecter'}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   CALENDRIER
========================================================= */

function CalendarView({
  monthDate,
  tasksByDate,
  getProjectColor,
  selectedDay,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
}) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const cells = useMemo(
    () => getMonthMatrix(year, month),
    [year, month]
  );

  const monthLabel = `${MONTHS_FR[month]} ${year}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          className="icon-btn"
          onClick={onPrevMonth}
        >
          <ChevronLeft size={16} />
        </button>

        <h2 className="font-display uppercase">
          {monthLabel}
        </h2>

        <button
          className="icon-btn"
          onClick={onNextMonth}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {DAYS_FR.map((day) => (
          <div
            key={day}
            className="text-xs font-semibold"
            style={{
              color: 'var(--ink-light)',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const dayTasks =
            tasksByDate[cell.iso] || [];

          const isToday =
            cell.iso === todayISO();

          const isSelected =
            cell.iso === selectedDay;

          return (
            <button
              key={cell.iso}
              className="calendar-cell"
              onClick={() =>
                onSelectDay(cell.iso)
              }
              style={{
                opacity: cell.currentMonth
                  ? 1
                  : 0.35,
                borderColor: isSelected
                  ? 'var(--pitch)'
                  : 'var(--line)',
                background: isToday
                  ? 'var(--pitch-tint)'
                  : 'var(--white)',
              }}
            >
              <span className="text-xs font-semibold">
                {cell.day}
              </span>

              <div className="flex gap-0.5 flex-wrap justify-center mt-1">
                {dayTasks
                  .slice(0, 3)
                  .map((task) => (
                    <span
                      key={task.id}
                      className="dot"
                      style={{
                        background:
                          getProjectColor(
                            task.projectId
                          ),
                      }}
                    />
                  ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MemberLegend({ users, getMemberColor }) {
  if (!users.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {users.map((user) => (
        <span
          key={user.username}
          className="pill"
          style={{
            background: 'var(--chalk)',
            color: 'var(--ink)',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: getMemberColor(user.displayName),
              display: 'inline-block',
            }}
          />
          {user.displayName}
        </span>
      ))}
    </div>
  );
}

function WeekView({
  weekAnchor,
  eventsByDate,
  getMemberColor,
  onPrevWeek,
  onNextWeek,
  onAddEventDay,
  onDeleteEvent,
}) {
  const days = useMemo(
    () => getWeekDays(weekAnchor),
    [weekAnchor]
  );

  const first = days[0].date;
  const last = days[6].date;

  const rangeLabel =
    first.getMonth() === last.getMonth()
      ? `${first.getDate()} - ${last.getDate()} ${
          MONTHS_FR[first.getMonth()]
        } ${first.getFullYear()}`
      : `${first.getDate()} ${
          MONTHS_FR[first.getMonth()]
        } - ${last.getDate()} ${MONTHS_FR[last.getMonth()]} ${last.getFullYear()}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button className="icon-btn" onClick={onPrevWeek}>
          <ChevronLeft size={16} />
        </button>

        <h2 className="font-display uppercase">{rangeLabel}</h2>

        <button className="icon-btn" onClick={onNextWeek}>
          <ChevronRight size={16} />
        </button>
      </div>

      <div
        className="grid grid-cols-7 gap-2"
        style={{ alignItems: 'start' }}
      >
        {days.map((day, i) => {
          const dayEvents = eventsByDate[day.iso] || [];
          const isToday = day.iso === todayISO();

          return (
            <div
              key={day.iso}
              style={{
                border: '1px solid var(--line)',
                borderRadius: 10,
                padding: 8,
                minHeight: 140,
                background: isToday
                  ? 'var(--pitch-tint)'
                  : 'var(--white)',
              }}
            >
              <div className="flex items-center justify-between">
                <p
                  className="text-xs font-semibold"
                  style={{ color: 'var(--ink-light)' }}
                >
                  {DAYS_FR[i]} {day.date.getDate()}
                </p>

                <button
                  className="icon-btn"
                  style={{ width: 20, height: 20, borderRadius: 5 }}
                  onClick={() => onAddEventDay(day.iso)}
                >
                  <Plus size={11} />
                </button>
              </div>

              <div
                className="mt-2"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                {dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      borderLeft: `3px solid ${getMemberColor(
                        ev.assignee
                      )}`,
                      background: 'var(--chalk)',
                      borderRadius: 6,
                      padding: '4px 6px',
                    }}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className="text-xs font-semibold"
                        style={{
                          color: getMemberColor(ev.assignee),
                        }}
                      >
                        {ev.time || ''}
                      </p>

                      <button
                        className="icon-btn"
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          border: 'none',
                        }}
                        onClick={() => onDeleteEvent(ev.id)}
                      >
                        <X size={9} />
                      </button>
                    </div>

                    <p
                      className="text-xs"
                      style={{ color: 'var(--ink)' }}
                    >
                      {ev.title}
                    </p>

                    <p
                      className="text-xs"
                      style={{ color: 'var(--ink-light)' }}
                    >
                      {ev.assignee}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

export default function MeleeApp() {
  const [session, setSession] =
    useState(null);

  const [users, setUsers] =
    useState([]);

  const [projects, setProjects] =
    useState([]);

  const [tasks, setTasks] =
    useState([]);

  const [dataLoaded, setDataLoaded] =
    useState(false);

  const [authBusy, setAuthBusy] =
    useState(false);

  const [authError, setAuthError] =
    useState('');

  const [syncing, setSyncing] =
    useState(false);

  const [lastSync, setLastSync] =
    useState(null);

  const [toast, setToast] =
    useState(null);

  const [activeTab, setActiveTab] =
    useState('home');

  const [selectedProjectId, setSelectedProjectId] =
    useState(null);

  const [showProjectForm, setShowProjectForm] =
    useState(false);

  const [editingProject, setEditingProject] =
    useState(null);

  const [confirmState, setConfirmState] =
    useState(null);

  const [planningView, setPlanningView] =
    useState('calendar');

  const [calendarMonth, setCalendarMonth] =
    useState(new Date());

  const [selectedDay, setSelectedDay] =
    useState(null);

  const [showUserMenu, setShowUserMenu] =
    useState(false);

  const [showUserForm, setShowUserForm] =
    useState(false);

  const [resetPasswordUser, setResetPasswordUser] =
    useState(null);

  const [events, setEvents] = useState([]);

  const [showEventForm, setShowEventForm] =
    useState(false);

  const [eventFormDate, setEventFormDate] =
    useState(null);

  const [weekAnchor, setWeekAnchor] = useState(
    new Date()
  );

  /* =====================================================
     TOAST
  ===================================================== */

  function showToast(message) {
    setToast({ message });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  }

  /* =====================================================
     CHARGEMENT SUPABASE
  ===================================================== */

  async function loadData() {
    try {
      const [
        usersResult,
        projectsResult,
        tasksResult,
        eventsResult,
      ] = await Promise.all([
        supabase
          .from('users')
          .select('*')
          .order('created_at', {
            ascending: true,
          }),

        supabase
          .from('projects')
          .select('*')
          .order('created_at', {
            ascending: true,
          }),

        supabase
          .from('tasks')
          .select('*')
          .order('created_at', {
            ascending: true,
          }),

        supabase
          .from('events')
          .select('*')
          .order('event_date', {
            ascending: true,
          }),
      ]);

      if (usersResult.error)
        throw usersResult.error;

      if (projectsResult.error)
        throw projectsResult.error;

      if (tasksResult.error)
        throw tasksResult.error;

      if (eventsResult.error)
        throw eventsResult.error;

      setUsers(
        (usersResult.data || []).map(
          (u) => ({
            username: u.username,
            displayName:
              u.display_name,
            role: u.role,
            passwordHash:
              u.password_hash,
          })
        )
      );

      setProjects(
        (projectsResult.data || []).map(
          (p) => ({
            id: p.id,
            name: p.name,
            description:
              p.description || '',
            startDate:
              p.start_date || '',
            endDate:
              p.end_date || '',
            status: p.status,
            color:
              p.color ||
              PROJECT_COLORS[0],
            createdBy:
              p.created_by || '',
            createdAt:
              p.created_at,
          })
        )
      );

      setTasks(
        (tasksResult.data || []).map(
          (t) => ({
            id: t.id,
            projectId:
              t.project_id,
            title: t.title,
            dueDate:
              t.due_date || '',
            assignee:
              t.assignee || '',
            status: t.status,
            createdBy:
              t.created_by || '',
            createdAt:
              t.created_at,
          })
        )
      );

      setEvents(
        (eventsResult.data || []).map(
          (e) => ({
            id: e.id,
            title: e.title,
            date: e.event_date || '',
            time: e.event_time || '',
            assignee: e.assignee || '',
            createdBy: e.created_by || '',
            createdAt: e.created_at,
          })
        )
      );

      setLastSync(new Date());
    } catch (error) {
      console.error(error);

      showToast(
        "Impossible de charger les données Supabase."
      );
    }
  }

  /* =====================================================
     SESSION
  ===================================================== */

  useEffect(() => {
    const saved =
      localStorage.getItem(
        'melee_session'
      );

    if (saved) {
      try {
        setSession(
          JSON.parse(saved)
        );
      } catch {
        localStorage.removeItem(
          'melee_session'
        );
      }
    }

    loadData().finally(() => {
      setDataLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!dataLoaded || !session)
      return;

    const interval = setInterval(() => {
      if (
        document.visibilityState ===
        'visible'
      ) {
        loadData();
      }
    }, 10000);

    return () =>
      clearInterval(interval);
  }, [dataLoaded, session]);

  useEffect(() => {
    if (!dataLoaded || !session)
      return;

    const stillExists = users.some(
      (u) =>
        u.username.toLowerCase() ===
        session.username.toLowerCase()
    );

    if (!stillExists) {
      handleLogout();
    }
  }, [dataLoaded, users, session]);

  /* =====================================================
     AUTHENTIFICATION
  ===================================================== */

  async function handleBootstrapCreate({
    username,
    displayName,
    password,
  }) {
    setAuthBusy(true);
    setAuthError('');

    try {
      const exists =
        users.some(
          (u) =>
            u.username.toLowerCase() ===
            username.toLowerCase()
        );

      if (exists) {
        setAuthError(
          'Cet identifiant existe déjà.'
        );

        setAuthBusy(false);
        return;
      }

      const passwordHash =
        await hashPassword(
          username,
          password
        );

      const { error } =
        await supabase
          .from('users')
          .insert({
            username,
            display_name:
              displayName,
            role: 'admin',
            password_hash:
              passwordHash,
          });

      if (error)
        throw error;

      const newSession = {
        username,
        displayName,
        role: 'admin',
      };

      setSession(newSession);

      localStorage.setItem(
        'melee_session',
        JSON.stringify(
          newSession
        )
      );

      await loadData();
    } catch (error) {
      console.error(error);

      setAuthError(
        "La création du compte a échoué."
      );
    }

    setAuthBusy(false);
  }

  async function handleLogin(
    username,
    password
  ) {
    setAuthBusy(true);
    setAuthError('');

    try {
      const { data, error } =
        await supabase
          .from('users')
          .select('*')
          .ilike(
            'username',
            username
          )
          .maybeSingle();

      if (error)
        throw error;

      if (!data) {
        setAuthError(
          'Identifiant ou mot de passe incorrect.'
        );

        setAuthBusy(false);
        return;
      }

      const hash =
        await hashPassword(
          data.username,
          password
        );

      if (
        hash !== data.password_hash
      ) {
        setAuthError(
          'Identifiant ou mot de passe incorrect.'
        );

        setAuthBusy(false);
        return;
      }

      const newSession = {
        username:
          data.username,
        displayName:
          data.display_name,
        role: data.role,
      };

      setSession(newSession);

      localStorage.setItem(
        'melee_session',
        JSON.stringify(
          newSession
        )
      );

      await loadData();
    } catch (error) {
      console.error(error);

      setAuthError(
        'La connexion a échoué.'
      );
    }

    setAuthBusy(false);
  }

  function handleLogout() {
    setSession(null);
    setShowUserMenu(false);

    localStorage.removeItem(
      'melee_session'
    );

    setActiveTab('home');
    setSelectedProjectId(null);
  }

  /* =====================================================
     UTILISATEURS
  ===================================================== */

  async function createUser({
    username,
    displayName,
    password,
    role,
  }) {
    const passwordHash =
      await hashPassword(
        username,
        password
      );

    const { error } =
      await supabase
        .from('users')
        .insert({
          username,
          display_name:
            displayName,
          role,
          password_hash:
            passwordHash,
        });

    if (error) {
      console.error(error);

      showToast(
        "Impossible de créer le compte."
      );
      return false;
    }

    await loadData();

    showToast(
      'Compte créé avec succès.'
    );

    return true;
  }

  async function updateUserRole(
    username,
    role
  ) {
    const otherAdmins = users.filter(
      (u) =>
        u.role === 'admin' &&
        u.username !== username
    );

    if (
      role !== 'admin' &&
      !otherAdmins.length
    ) {
      showToast(
        'Impossible de retirer le dernier administrateur.'
      );
      return;
    }

    try {
      const { error } =
        await supabase
          .from('users')
          .update({ role })
          .eq('username', username);

      if (error) throw error;

      await loadData();

      showToast('Rôle mis à jour.');
    } catch (error) {
      console.error(error);

      showToast(
        'Impossible de modifier le rôle.'
      );
    }
  }

  async function resetUserPassword(
    username,
    newPassword
  ) {
    try {
      const passwordHash =
        await hashPassword(
          username,
          newPassword
        );

      const { error } =
        await supabase
          .from('users')
          .update({
            password_hash:
              passwordHash,
          })
          .eq('username', username);

      if (error) throw error;

      showToast(
        'Mot de passe réinitialisé.'
      );
    } catch (error) {
      console.error(error);

      showToast(
        "Impossible de réinitialiser le mot de passe."
      );
    }
  }

  async function deleteUser(username) {
    if (username === session.username) {
      showToast(
        'Tu ne peux pas supprimer ton propre compte.'
      );
      return;
    }

    const target = users.find(
      (u) => u.username === username
    );

    const otherAdmins = users.filter(
      (u) =>
        u.role === 'admin' &&
        u.username !== username
    );

    if (
      target?.role === 'admin' &&
      !otherAdmins.length
    ) {
      showToast(
        'Impossible de supprimer le dernier administrateur.'
      );
      return;
    }

    try {
      const { error } =
        await supabase
          .from('users')
          .delete()
          .eq('username', username);

      if (error) throw error;

      await loadData();

      showToast('Membre supprimé.');
    } catch (error) {
      console.error(error);

      showToast(
        'Impossible de supprimer le membre.'
      );
    }
  }

  /* =====================================================
     PROJETS
  ===================================================== */

  async function saveProject(data) {
    try {
      if (editingProject) {
        const { error } =
          await supabase
            .from('projects')
            .update({
              name: data.name,
              description:
                data.description,
              start_date:
                data.startDate ||
                null,
              end_date:
                data.endDate ||
                null,
              status: data.status,
            })
            .eq(
              'id',
              editingProject.id
            );

        if (error)
          throw error;
      } else {
        const { error } =
          await supabase
            .from('projects')
            .insert({
              id: genId(),
              name: data.name,
              description:
                data.description,
              start_date:
                data.startDate ||
                null,
              end_date:
                data.endDate ||
                null,
              status: data.status,
              color:
                PROJECT_COLORS[
                  projects.length %
                    PROJECT_COLORS.length
                ],
              created_by:
                session.displayName,
            });

        if (error)
          throw error;
      }

      await loadData();

      setShowProjectForm(false);
      setEditingProject(null);
    } catch (error) {
      console.error(error);

      showToast(
        "Impossible d'enregistrer le projet."
      );
    }
  }

  async function deleteProject(id) {
    try {
      await supabase
        .from('tasks')
        .delete()
        .eq('project_id', id);

      const { error } =
        await supabase
          .from('projects')
          .delete()
          .eq('id', id);

      if (error)
        throw error;

      setSelectedProjectId(null);

      await loadData();
    } catch (error) {
      console.error(error);

      showToast(
        'Impossible de supprimer le projet.'
      );
    }
  }

  /* =====================================================
     TACHES
  ===================================================== */

  async function addTask(
    projectId,
    data
  ) {
    try {
      const { error } =
        await supabase
          .from('tasks')
          .insert({
            id: genId(),
            project_id:
              projectId,
            title:
              data.title,
            due_date:
              data.dueDate ||
              null,
            assignee:
              data.assignee ||
              session.displayName,
            status:
              'a_venir',
            created_by:
              session.displayName,
          });

      if (error)
        throw error;

      await loadData();
    } catch (error) {
      console.error(error);

      showToast(
        "Impossible d'ajouter la tâche."
      );
    }
  }

  async function toggleTaskStatus(
    task
  ) {
    const index =
      STATUS_ORDER.indexOf(
        task.status
      );

    const next =
      STATUS_ORDER[
        (index + 1) %
          STATUS_ORDER.length
      ];

    try {
      const { error } =
        await supabase
          .from('tasks')
          .update({
            status: next,
          })
          .eq(
            'id',
            task.id
          );

      if (error)
        throw error;

      await loadData();
    } catch (error) {
      console.error(error);

      showToast(
        'Impossible de modifier la tâche.'
      );
    }
  }

  async function deleteTask(id) {
    try {
      const { error } =
        await supabase
          .from('tasks')
          .delete()
          .eq('id', id);

      if (error)
        throw error;

      await loadData();
    } catch (error) {
      console.error(error);

      showToast(
        'Impossible de supprimer la tâche.'
      );
    }
  }

  /* =====================================================
     EVENEMENTS
  ===================================================== */

  async function addEvent(data) {
    try {
      const { error } =
        await supabase
          .from('events')
          .insert({
            id: genId(),
            title: data.title,
            event_date: data.date,
            event_time: data.time || null,
            assignee:
              data.assignee ||
              session.displayName,
            created_by: session.displayName,
          });

      if (error) throw error;

      await loadData();

      setShowEventForm(false);

      showToast('Événement ajouté.');
    } catch (error) {
      console.error(error);

      showToast(
        "Impossible d'ajouter l'événement."
      );
    }
  }

  async function deleteEvent(id) {
    try {
      const { error } =
        await supabase
          .from('events')
          .delete()
          .eq('id', id);

      if (error) throw error;

      await loadData();
    } catch (error) {
      console.error(error);

      showToast(
        "Impossible de supprimer l'événement."
      );
    }
  }

  function getMemberColor(displayName) {
    const idx = users.findIndex(
      (u) => u.displayName === displayName
    );

    return MEMBER_COLORS[
      Math.max(0, idx) % MEMBER_COLORS.length
    ];
  }

  /* =====================================================
     NAVIGATION
  ===================================================== */

  function goToTab(id) {
    setActiveTab(id);
    setSelectedProjectId(null);
    setSelectedDay(null);
  }

  function getProject(id) {
    return projects.find(
      (project) =>
        project.id === id
    );
  }

  function getProjectColor(id) {
    const project =
      getProject(id);

    return project
      ? project.color
      : '#999';
  }

  /* =====================================================
     DONNÉES CALCULÉES
  ===================================================== */

  const selectedProject =
    selectedProjectId
      ? getProject(
          selectedProjectId
        )
      : null;

  const selectedProjectTasks =
    selectedProject
      ? tasks.filter(
          (task) =>
            task.projectId ===
            selectedProject.id
        )
      : [];

  const activeProjectsCount =
    projects.filter(
      (p) =>
        p.status ===
        'en_cours'
    ).length;

  const todoTasksCount =
    tasks.filter(
      (t) =>
        t.status !==
        'termine'
    ).length;

  const overdueTasksCount =
    tasks.filter(
      (t) =>
        t.status !==
          'termine' &&
        t.dueDate &&
        daysBetween(
          t.dueDate
        ) < 0
    ).length;

  const upcomingTasks =
    useMemo(
      () =>
        tasks
          .filter(
            (t) =>
              t.status !==
                'termine' &&
              t.dueDate
          )
          .sort((a, b) =>
            a.dueDate.localeCompare(
              b.dueDate
            )
          )
          .slice(0, 5),
      [tasks]
    );

  const tasksByDate =
    useMemo(() => {
      const result = {};

      tasks.forEach(
        (task) => {
          if (!task.dueDate)
            return;

          if (
            !result[
              task.dueDate
            ]
          ) {
            result[
              task.dueDate
            ] = [];
          }

          result[
            task.dueDate
          ].push(task);
        }
      );

      return result;
    }, [tasks]);

  const eventsByDate =
    useMemo(() => {
      const result = {};

      events.forEach((event) => {
        if (!event.date) return;

        if (!result[event.date]) {
          result[event.date] = [];
        }

        result[event.date].push(event);
      });

      Object.values(result).forEach((list) =>
        list.sort((a, b) =>
          (a.time || '').localeCompare(b.time || '')
        )
      );

      return result;
    }, [events]);

  const now = new Date();

  const todayLabelFR =
    `${DAYS_FULL_FR[now.getDay()]} ` +
    `${now.getDate()} ` +
    `${MONTHS_FR[now.getMonth()]} ` +
    `${now.getFullYear()}`;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="melee-app">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Work+Sans:wght@400;500;600;700&display=swap');

        .melee-app {
          --pitch-dark:#1A1A1A;
          --pitch:#E3B100;
          --pitch-tint:#FFF4D6;
          --chalk:#F7F5F0;
          --ink:#20241F;
          --ink-light:#5C6259;
          --tan:#B08968;
          --tan-text:#8A5A34;
          --tan-tint:#F1E6DC;
          --amber:#B9791F;
          --amber-tint:#FBEBD0;
          --red:#B23A30;
          --red-tint:#F6DEDC;
          --line:#E4E0D6;
          --white:#FFFFFF;
          font-family:'Work Sans',sans-serif;
          background:var(--chalk);
          color:var(--ink);
          min-height:100vh;
        }

        .melee-app *,
        .melee-app *::before,
        .melee-app *::after {
          box-sizing:border-box;
        }

        .melee-app .font-display {
          font-family:'Oswald',sans-serif;
        }

        .melee-app button:disabled {
          opacity:.5;
          cursor:not-allowed;
        }

        .melee-app .app-header {
          background:var(--pitch-dark);
          color:var(--chalk);
          padding:14px 20px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          position:sticky;
          top:0;
          z-index:20;
        }

        .melee-app .logo-mark {
          width:10px;
          height:10px;
          background:var(--pitch);
          border-radius:2px;
          transform:rotate(45deg);
          display:inline-block;
        }

        .melee-app .user-badge,
        .melee-app .header-icon-btn {
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:6px;
          background:rgba(247,245,240,.1);
          border:1px solid rgba(247,245,240,.25);
          color:var(--chalk);
          cursor:pointer;
        }

        .melee-app .user-badge {
          padding:6px 10px;
          border-radius:999px;
          font-size:13px;
        }

        .melee-app .header-icon-btn {
          width:32px;
          height:32px;
          border-radius:8px;
        }

        .melee-app .app-nav {
          display:flex;
          gap:4px;
          overflow-x:auto;
          background:var(--white);
          border-bottom:1px solid var(--line);
          padding:0 12px;
        }

        .melee-app .nav-tab {
          display:flex;
          align-items:center;
          gap:6px;
          white-space:nowrap;
          padding:12px;
          font-size:13px;
          font-weight:600;
          color:var(--ink-light);
          border-bottom:2px solid transparent;
          cursor:pointer;
          background:none;
          border-top:none;
          border-left:none;
          border-right:none;
        }

        .melee-app .nav-tab.active {
          color:var(--pitch-dark);
          border-bottom-color:var(--pitch);
        }

        .melee-app .stub-dot {
          width:5px;
          height:5px;
          border-radius:50%;
          background:var(--tan);
        }

        .melee-app .pitch-divider {
          height:6px;
          margin:16px 0;
          background-image:repeating-linear-gradient(
            90deg,
            var(--line) 0 14px,
            transparent 14px 22px
          );
        }

        .melee-app .card,
        .melee-app .stat-card {
          background:var(--white);
          border:1px solid var(--line);
          border-radius:12px;
          padding:16px;
        }

        .melee-app .card {
          cursor:pointer;
          transition:.15s;
        }

        .melee-app .card:hover {
          transform:translateY(-2px);
          box-shadow:0 6px 16px rgba(22,53,42,.08);
        }

        .melee-app .score {
          font-family:'Oswald',sans-serif;
          font-size:22px;
          font-weight:600;
        }

        .melee-app .pill {
          display:inline-flex;
          align-items:center;
          gap:4px;
          padding:2px 9px;
          border-radius:999px;
          font-size:11px;
          font-weight:600;
          text-transform:uppercase;
        }

        .melee-app .btn-primary,
        .melee-app .btn-secondary,
        .melee-app .icon-btn {
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:6px;
          cursor:pointer;
        }

        .melee-app .btn-primary {
          background:var(--pitch-dark);
          color:var(--chalk);
          font-weight:600;
          font-size:14px;
          padding:9px 16px;
          border-radius:9px;
          border:none;
        }

        .melee-app .btn-secondary {
          background:var(--white);
          color:var(--ink);
          font-weight:600;
          font-size:14px;
          padding:9px 16px;
          border-radius:9px;
          border:1px solid var(--line);
        }

        .melee-app .icon-btn {
          width:32px;
          height:32px;
          border-radius:8px;
          border:1px solid var(--line);
          background:var(--white);
          color:var(--ink-light);
        }

        .melee-app input[type=text],
        .melee-app input[type=password],
        .melee-app input[type=date],
        .melee-app textarea,
        .melee-app select {
          width:100%;
          border:1px solid var(--line);
          border-radius:8px;
          padding:8px 10px;
          font-family:'Work Sans',sans-serif;
          font-size:14px;
          background:var(--white);
          color:var(--ink);
        }

        .melee-app label {
          font-size:12px;
          font-weight:600;
          color:var(--ink-light);
          text-transform:uppercase;
          display:block;
          margin-bottom:4px;
        }

        .melee-app .modal-overlay {
          position:fixed;
          inset:0;
          background:rgba(22,53,42,.45);
          backdrop-filter:blur(2px);
          display:flex;
          align-items:center;
          justify-content:center;
          z-index:50;
          padding:16px;
        }

        .melee-app .modal-card {
          position:relative;
          background:var(--white);
          border-radius:14px;
          padding:22px;
          width:100%;
          max-width:420px;
          max-height:90vh;
          overflow-y:auto;
        }

        .melee-app .calendar-cell {
          aspect-ratio:1;
          border:1px solid var(--line);
          border-radius:8px;
          display:flex;
          flex-direction:column;
          align-items:center;
          padding:4px;
          cursor:pointer;
        }

        .melee-app .dot {
          width:6px;
          height:6px;
          border-radius:50%;
        }

        .melee-app .toast {
          position:fixed;
          bottom:20px;
          right:20px;
          z-index:60;
          background:var(--red);
          color:white;
          padding:10px 16px;
          border-radius:9px;
          font-size:13px;
        }
      `}</style>

      {/* HEADER */}

      <header className="app-header">
        <div className="flex items-center gap-2">
          <span className="logo-mark" />

          <span
            className="font-display text-sm"
            style={{
              textTransform:'uppercase',
              letterSpacing:'.12em',
            }}
          >
            Mêlée
          </span>
        </div>

        {session && (
          <div className="flex items-center gap-2">
            <button
              className="header-icon-btn"
              onClick={async () => {
                setSyncing(true);
                await loadData();
                setSyncing(false);
              }}
            >
              <RefreshCw
                size={14}
                className={
                  syncing
                    ? 'animate-spin'
                    : ''
                }
              />
            </button>

            {session.role === 'admin' && (
              <button
                className="header-icon-btn"
                onClick={() =>
                  goToTab('admin')
                }
              >
                <Shield size={15} />
              </button>
            )}

            <button
              className="user-badge"
              onClick={() =>
                setShowUserMenu(
                  (v) => !v
                )
              }
            >
              <User size={13} />
              {session.displayName}
            </button>

            {showUserMenu && (
              <div
                style={{
                  position:'absolute',
                  top:60,
                  right:20,
                  background:'white',
                  border:'1px solid var(--line)',
                  borderRadius:10,
                  padding:6,
                  zIndex:100,
                }}
              >
                <button
                  className="btn-secondary"
                  onClick={handleLogout}
                >
                  <LogOut size={14} />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* NAV */}

      {session && (
        <nav className="app-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${
                activeTab === tab.id
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                goToTab(tab.id)
              }
            >
              <tab.icon size={15} />
              {tab.label}

              {tab.stub && (
                <span className="stub-dot" />
              )}
            </button>
          ))}

          {session.role === 'admin' && (
            <button
              className={`nav-tab ${
                activeTab === 'admin'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                goToTab('admin')
              }
            >
              <Shield size={15} />
              Administration
            </button>
          )}
        </nav>
      )}

      {/* MAIN */}

      <main
        className="max-w-5xl mx-auto"
        style={{
          padding:'20px 16px 60px',
        }}
      >
        {!dataLoaded ? (
          <div
            className="flex items-center justify-center"
            style={{
              padding:'80px 0',
            }}
          >
            <Loader2
              size={28}
              className="animate-spin"
            />
          </div>
        ) : !session ? (
          users.length === 0 ? (
            <BootstrapAdminForm
              onCreate={
                handleBootstrapCreate
              }
              busy={authBusy}
            />
          ) : (
            <LoginForm
              onLogin={handleLogin}
              busy={authBusy}
              error={authError}
            />
          )
        ) : (
          <>
            {/* ACCUEIL */}

            {activeTab === 'home' && (
              <div>
                <h1 className="font-display text-2xl">
                  Bonjour, {session.displayName} 👋
                </h1>

                <p
                  className="text-sm mt-1"
                  style={{
                    color:'var(--ink-light)',
                  }}
                >
                  {todayLabelFR}
                </p>

                <div className="pitch-divider" />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard
                    icon={FolderKanban}
                    label="Projets en cours"
                    value={activeProjectsCount}
                  />

                  <StatCard
                    icon={Clock}
                    label="Tâches à faire"
                    value={todoTasksCount}
                  />

                  <StatCard
                    icon={AlertOctagon}
                    label="En retard"
                    value={overdueTasksCount}
                    danger
                  />
                </div>

                <div className="mt-8">
                  <h2 className="font-display text-lg mb-2">
                    Prochaines échéances
                  </h2>

                  {upcomingTasks.length ===
                  0 ? (
                    <p
                      className="text-sm"
                      style={{
                        color:
                          'var(--ink-light)',
                      }}
                    >
                      Aucune échéance pour
                      l'instant.
                    </p>
                  ) : (
                    upcomingTasks.map(
                      (task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between py-2"
                          style={{
                            borderBottom:
                              '1px solid var(--line)',
                          }}
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {task.title}
                            </p>

                            <p
                              className="text-xs"
                              style={{
                                color:
                                  'var(--ink-light)',
                              }}
                            >
                              {getProject(
                                task.projectId
                              )?.name}
                            </p>
                          </div>

                          <span className="text-xs">
                            {formatDateFR(
                              task.dueDate
                            )}
                          </span>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>
            )}

            {/* PROJETS */}

            {activeTab === 'projects' &&
              !selectedProject && (
                <div>
                  <div className="flex items-center justify-between">
                    <h1 className="font-display text-2xl">
                      Projets
                    </h1>

                    <button
                      className="btn-primary"
                      onClick={() => {
                        setEditingProject(
                          null
                        );
                        setShowProjectForm(
                          true
                        );
                      }}
                    >
                      <Plus size={15} />
                      Nouveau projet
                    </button>
                  </div>

                  <div className="pitch-divider" />

                  {projects.length === 0 ? (
                    <p
                      className="text-sm"
                      style={{
                        color:
                          'var(--ink-light)',
                      }}
                    >
                      Aucun projet pour
                      l'instant.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {projects.map(
                        (project) => (
                          <ProjectCard
                            key={project.id}
                            project={
                              project
                            }
                            tasks={tasks}
                            onClick={() =>
                              setSelectedProjectId(
                                project.id
                              )
                            }
                          />
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

            {/* PROJET */}

            {activeTab === 'projects' &&
              selectedProject && (
                <div>
                  <button
                    className="btn-secondary"
                    onClick={() =>
                      setSelectedProjectId(
                        null
                      )
                    }
                  >
                    <ChevronLeft
                      size={14}
                    />
                    Projets
                  </button>

                  <div className="flex items-start justify-between mt-4">
                    <div>
                      <h1 className="font-display text-2xl">
                        {selectedProject.name}
                      </h1>

                      <StatusPill
                        status={
                          selectedProject.status
                        }
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="icon-btn"
                        onClick={() => {
                          setEditingProject(
                            selectedProject
                          );
                          setShowProjectForm(
                            true
                          );
                        }}
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        className="icon-btn"
                        onClick={() =>
                          setConfirmState({
                            message:
                              `Supprimer "${selectedProject.name}" ?`,
                            onConfirm:
                              async () => {
                                await deleteProject(
                                  selectedProject.id
                                );

                                setConfirmState(
                                  null
                                );
                              },
                          })
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {selectedProject.description && (
                    <p className="text-sm mt-3">
                      {
                        selectedProject.description
                      }
                    </p>
                  )}

                  <div className="pitch-divider" />

                  <h2 className="font-display text-lg">
                    Tâches (
                    {
                      selectedProjectTasks.filter(
                        (t) =>
                          t.status ===
                          'termine'
                      ).length
                    }{' '}
                    /{' '}
                    {
                      selectedProjectTasks.length
                    }
                    )
                  </h2>

                  {selectedProjectTasks.map(
                    (task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onToggleStatus={
                          toggleTaskStatus
                        }
                        onDelete={
                          deleteTask
                        }
                      />
                    )
                  )}

                  <TaskQuickAddForm
                    defaultAssignee={
                      session.displayName
                    }
                    users={users}
                    onAdd={(data) =>
                      addTask(
                        selectedProject.id,
                        data
                      )
                    }
                  />
                </div>
              )}

            {/* PLANNING */}

            {activeTab === 'planning' && (
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h1 className="font-display text-2xl">
                    Planning
                  </h1>

                  <div className="flex gap-1 flex-wrap">
                    <button
                      className="btn-secondary"
                      onClick={() =>
                        setPlanningView(
                          'calendar'
                        )
                      }
                    >
                      <Calendar size={14} />
                      Calendrier
                    </button>

                    <button
                      className="btn-secondary"
                      onClick={() =>
                        setPlanningView(
                          'semaine'
                        )
                      }
                    >
                      <CalendarDays size={14} />
                      Semaine
                    </button>

                    <button
                      className="btn-secondary"
                      onClick={() =>
                        setPlanningView(
                          'liste'
                        )
                      }
                    >
                      <List size={14} />
                      Liste
                    </button>

                    <button
                      className="btn-primary"
                      onClick={() => {
                        setEventFormDate(
                          selectedDay ||
                            todayISO()
                        );
                        setShowEventForm(
                          true
                        );
                      }}
                    >
                      <Plus size={14} />
                      Événement
                    </button>
                  </div>
                </div>

                <div className="pitch-divider" />

                {planningView !== 'liste' && (
                  <MemberLegend
                    users={users}
                    getMemberColor={
                      getMemberColor
                    }
                  />
                )}

                {planningView ===
                'calendar' ? (
                  <>
                    <CalendarView
                      monthDate={
                        calendarMonth
                      }
                      tasksByDate={
                        tasksByDate
                      }
                      getProjectColor={
                        getProjectColor
                      }
                      selectedDay={
                        selectedDay
                      }
                      onSelectDay={
                        setSelectedDay
                      }
                      onPrevMonth={() =>
                        setCalendarMonth(
                          new Date(
                            calendarMonth.getFullYear(),
                            calendarMonth.getMonth() -
                              1,
                            1
                          )
                        )
                      }
                      onNextMonth={() =>
                        setCalendarMonth(
                          new Date(
                            calendarMonth.getFullYear(),
                            calendarMonth.getMonth() +
                              1,
                            1
                          )
                        )
                      }
                    />

                    {selectedDay && (
                      <div className="mt-5">
                        <h3 className="font-display">
                          Tâches du{' '}
                          {formatDateFR(
                            selectedDay
                          )}
                        </h3>

                        {(tasksByDate[
                          selectedDay
                        ] || []).map(
                          (task) => (
                            <TaskRow
                              key={task.id}
                              task={task}
                              onToggleStatus={
                                toggleTaskStatus
                              }
                              onDelete={
                                deleteTask
                              }
                            />
                          )
                        )}

                        <div className="flex items-center justify-between mt-4">
                          <h3 className="font-display">
                            Événements du{' '}
                            {formatDateFR(
                              selectedDay
                            )}
                          </h3>

                          <button
                            className="btn-secondary"
                            onClick={() => {
                              setEventFormDate(
                                selectedDay
                              );
                              setShowEventForm(
                                true
                              );
                            }}
                          >
                            <Plus size={13} />
                            Ajouter
                          </button>
                        </div>

                        {(eventsByDate[
                          selectedDay
                        ] || []).length ===
                        0 ? (
                          <p
                            className="text-sm mt-2"
                            style={{
                              color:
                                'var(--ink-light)',
                            }}
                          >
                            Aucun événement.
                          </p>
                        ) : (
                          (eventsByDate[
                            selectedDay
                          ] || []).map(
                            (event) => (
                              <div
                                key={event.id}
                                className="flex items-center gap-3 py-2"
                                style={{
                                  borderBottom:
                                    '1px solid var(--line)',
                                }}
                              >
                                <span
                                  className="dot"
                                  style={{
                                    background:
                                      getMemberColor(
                                        event.assignee
                                      ),
                                  }}
                                />

                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {event.time && (
                                      <span
                                        style={{
                                          color:
                                            'var(--ink-light)',
                                        }}
                                      >
                                        {
                                          event.time
                                        }{' '}
                                      </span>
                                    )}
                                    {event.title}
                                  </p>

                                  <p
                                    className="text-xs"
                                    style={{
                                      color:
                                        'var(--ink-light)',
                                    }}
                                  >
                                    {event.assignee}
                                  </p>
                                </div>

                                <button
                                  className="icon-btn"
                                  onClick={() =>
                                    deleteEvent(
                                      event.id
                                    )
                                  }
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )
                          )
                        )}
                      </div>
                    )}
                  </>
                ) : planningView === 'semaine' ? (
                  <WeekView
                    weekAnchor={weekAnchor}
                    eventsByDate={eventsByDate}
                    getMemberColor={
                      getMemberColor
                    }
                    onPrevWeek={() =>
                      setWeekAnchor(
                        new Date(
                          weekAnchor.getFullYear(),
                          weekAnchor.getMonth(),
                          weekAnchor.getDate() - 7
                        )
                      )
                    }
                    onNextWeek={() =>
                      setWeekAnchor(
                        new Date(
                          weekAnchor.getFullYear(),
                          weekAnchor.getMonth(),
                          weekAnchor.getDate() + 7
                        )
                      )
                    }
                    onAddEventDay={(iso) => {
                      setEventFormDate(iso);
                      setShowEventForm(true);
                    }}
                    onDeleteEvent={deleteEvent}
                  />
                ) : (
                  <div>
                    {tasks
                      .filter(
                        (t) =>
                          t.status !==
                            'termine' &&
                          t.dueDate
                      )
                      .sort((a, b) =>
                        a.dueDate.localeCompare(
                          b.dueDate
                        )
                      )
                      .map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onToggleStatus={
                            toggleTaskStatus
                          }
                          onDelete={
                            deleteTask
                          }
                        />
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* ADMINISTRATION */}

            {activeTab === 'admin' &&
              session.role === 'admin' && (
                <div>
                  <div className="flex items-center justify-between">
                    <h1 className="font-display text-2xl">
                      Administration
                    </h1>

                    <button
                      className="btn-primary"
                      onClick={() =>
                        setShowUserForm(
                          true
                        )
                      }
                    >
                      <UserPlus size={15} />
                      Nouveau membre
                    </button>
                  </div>

                  <div className="pitch-divider" />

                  {users.map((user) => {
                    const isLastAdmin =
                      user.role ===
                        'admin' &&
                      users.filter(
                        (u) =>
                          u.role ===
                          'admin'
                      ).length === 1;

                    const isSelf =
                      user.username ===
                      session.username;

                    return (
                      <div
                        key={
                          user.username
                        }
                        className="flex items-center justify-between py-3 gap-3"
                        style={{
                          borderBottom:
                            '1px solid var(--line)',
                        }}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">
                            {
                              user.displayName
                            }
                          </p>

                          <p
                            className="text-xs"
                            style={{
                              color:
                                'var(--ink-light)',
                            }}
                          >
                            @
                            {
                              user.username
                            }
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={
                              user.role
                            }
                            disabled={
                              isLastAdmin
                            }
                            onChange={(
                              e
                            ) =>
                              updateUserRole(
                                user.username,
                                e.target
                                  .value
                              )
                            }
                            style={{
                              width: 'auto',
                            }}
                          >
                            <option value="membre">
                              Membre
                            </option>

                            <option value="admin">
                              Admin
                            </option>
                          </select>

                          <button
                            className="icon-btn"
                            title="Réinitialiser le mot de passe"
                            onClick={() =>
                              setResetPasswordUser(
                                user
                              )
                            }
                          >
                            <KeyRound size={14} />
                          </button>

                          <button
                            className="icon-btn"
                            title="Supprimer le membre"
                            disabled={
                              isSelf ||
                              isLastAdmin
                            }
                            onClick={() =>
                              setConfirmState({
                                message: `Supprimer "${user.displayName}" ?`,
                                onConfirm:
                                  async () => {
                                    await deleteUser(
                                      user.username
                                    );

                                    setConfirmState(
                                      null
                                    );
                                  },
                              })
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            {/* PAGES EN CONSTRUCTION */}

            {[
              'cycles',
              'chat',
              'docs',
            ].includes(activeTab) && (
              <div
                className="flex flex-col items-center text-center"
                style={{
                  padding:'64px 16px',
                }}
              >
                {React.createElement(
                  STUB_CONTENT[
                    activeTab
                  ].icon,
                  { size: 40 }
                )}

                <h2 className="font-display text-xl mt-3">
                  {
                    STUB_CONTENT[
                      activeTab
                    ].title
                  }
                </h2>

                <p
                  className="text-sm mt-2"
                  style={{
                    color:
                      'var(--ink-light)',
                  }}
                >
                  {
                    STUB_CONTENT[
                      activeTab
                    ].description
                  }
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL PROJET */}

      {showProjectForm && (
        <ProjectFormModal
          initial={editingProject}
          onSubmit={saveProject}
          onCancel={() => {
            setShowProjectForm(
              false
            );
            setEditingProject(null);
          }}
        />
      )}

      {/* NOUVEAU MEMBRE */}

      {showUserForm && (
        <UserFormModal
          existingUsernames={users.map(
            (u) => u.username
          )}
          onCreate={createUser}
          onCancel={() =>
            setShowUserForm(false)
          }
        />
      )}

      {/* REINITIALISATION MOT DE PASSE */}

      {resetPasswordUser && (
        <ResetPasswordModal
          user={resetPasswordUser}
          onConfirm={async (
            newPassword
          ) => {
            await resetUserPassword(
              resetPasswordUser.username,
              newPassword
            );

            setResetPasswordUser(null);
          }}
          onCancel={() =>
            setResetPasswordUser(null)
          }
        />
      )}

      {/* NOUVEL EVENEMENT */}

      {showEventForm && (
        <EventFormModal
          initialDate={eventFormDate}
          users={users}
          defaultAssignee={
            session.displayName
          }
          onSubmit={addEvent}
          onCancel={() =>
            setShowEventForm(false)
          }
        />
      )}

      {/* CONFIRMATION */}

      {confirmState && (
        <ConfirmDialog
          title="Confirmer"
          message={
            confirmState.message
          }
          onConfirm={
            confirmState.onConfirm
          }
          onCancel={() =>
            setConfirmState(null)
          }
        />
      )}

      {/* TOAST */}

      {toast && (
        <div className="toast">
          {toast.message}
        </div>
      )}
    </div>
  );
}