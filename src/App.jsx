import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
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
  Send,
  Search,
  Folder,
  FolderPlus,
  Upload,
  ExternalLink,
  Link2,
  Unlink,
  ClipboardList,
  Star,
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  ZoomIn,
  ZoomOut,
  Maximize,
  Type,
  Workflow,
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

const NAV_ITEMS = [
  { id: 'home', label: 'Accueil', icon: HomeIcon },
  { id: 'projects', label: 'Projets', icon: FolderKanban },
  { id: 'planning', label: 'Planning', icon: CalendarDays },
  { id: 'docs', label: 'Documents', icon: FileText },
  { id: 'finance', label: 'Finance', icon: Wallet },
  {
    id: 'edr',
    label: 'EDR',
    icon: ClipboardList,
    children: [
      {
        id: 'evaluations',
        label: 'Évaluations',
        icon: ClipboardList,
      },
    ],
  },
  {
    id: 'scolaire',
    label: 'Scolaire',
    icon: Dumbbell,
    children: [
      {
        id: 'cycles',
        label: 'Cycles rugby',
        icon: Dumbbell,
        stub: true,
      },
    ],
  },
];

const PLAYER_CATEGORIES = [
  'U6',
  'U8',
  'U10',
  'U12',
  'U14',
];

const EVAL_THEMES = [
  {
    id: 'passe',
    label: 'Passe',
    subcategories: [
      { id: 'passe_droite', label: 'Passe à droite' },
      { id: 'passe_gauche', label: 'Passe à gauche' },
      {
        id: 'passe_precision',
        label: "Précision / vitesse d'exécution",
      },
      {
        id: 'passe_pression',
        label: 'Passe sous pression',
      },
    ],
  },
  {
    id: 'physique',
    label: 'Qualité physique',
    subcategories: [
      { id: 'phys_vitesse', label: 'Vitesse' },
      { id: 'phys_endurance', label: 'Endurance' },
      { id: 'phys_force', label: 'Force / puissance' },
      {
        id: 'phys_agilite',
        label: 'Agilité / coordination',
      },
    ],
  },
  {
    id: 'defense',
    label: 'Défense',
    subcategories: [
      { id: 'def_plaquage', label: 'Plaquage' },
      {
        id: 'def_placement',
        label: 'Placement défensif',
      },
      { id: 'def_anticipation', label: 'Anticipation' },
      {
        id: 'def_engagement',
        label: 'Engagement / intensité',
      },
    ],
  },
  {
    id: 'posture',
    label: 'Posture',
    subcategories: [
      {
        id: 'pos_positions',
        label: 'Positions sécuritaires',
      },
      {
        id: 'pos_attitude',
        label: 'Attitude de sécurité',
      },
      {
        id: 'pos_gestes',
        label: 'Maîtrise des gestes',
      },
    ],
  },
  {
    id: 'attaque',
    label: 'Attaque',
    subcategories: [
      {
        id: 'att_espace',
        label: "Prise d'espace / course",
      },
      {
        id: 'att_percussion',
        label: 'Percussion / franchissement',
      },
      { id: 'att_soutien', label: 'Soutien de jeu' },
      {
        id: 'att_decision',
        label: 'Prise de décision en attaque',
      },
    ],
  },
  {
    id: 'cognitif',
    label: 'Cognitif',
    subcategories: [
      { id: 'cog_lecture', label: 'Lecture du jeu' },
      { id: 'cog_decision', label: 'Prise de décision' },
      {
        id: 'cog_systemes',
        label: 'Compréhension des systèmes de jeu',
      },
      {
        id: 'cog_concentration',
        label: 'Concentration',
      },
    ],
  },
];

const STUB_CONTENT = {
  cycles: {
    icon: Dumbbell,
    title: 'Cycles rugby',
    description:
      "La gestion des cycles d'entraînement arrivera dans une prochaine itération.",
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

function getDmChannel(usernameA, usernameB) {
  return 'dm:' + [usernameA, usernameB].sort().join(':');
}

function formatBytes(bytes) {
  if (!bytes) return '0 Ko';

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} Ko`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024;

function mapMessageRow(m) {
  return {
    id: m.id,
    channel: m.channel,
    senderUsername: m.sender_username,
    senderDisplayName: m.sender_display_name,
    text: m.text,
    createdAt: m.created_at,
  };
}

const ONLINE_THRESHOLD_MS = 30000;

function isOnline(user) {
  if (!user?.lastSeen) return false;

  return (
    Date.now() -
      new Date(user.lastSeen).getTime() <
    ONLINE_THRESHOLD_MS
  );
}

function getThemeAverage(scores, theme) {
  const values = theme.subcategories.map(
    (sub) => scores[sub.id] || 0
  );

  const sum = values.reduce((a, b) => a + b, 0);

  return values.length ? sum / values.length : 0;
}

function getThemeAverages(scores) {
  return EVAL_THEMES.map((theme) => ({
    id: theme.id,
    label: theme.label,
    value: getThemeAverage(scores || {}, theme),
  }));
}

function getOverallAverage(scores) {
  const averages = getThemeAverages(scores);

  const sum = averages.reduce(
    (a, t) => a + t.value,
    0
  );

  return averages.length ? sum / averages.length : 0;
}

function formatCurrency(amount) {
  return `${(amount || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
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

function TaskRow({
  task,
  onToggleStatus,
  onDelete,
  onEdit,
  getMemberColor,
  onToggleCanvas,
  isOnCanvas,
}) {
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
          {task.assignees && task.assignees.length > 0 && (
            <span
              className="text-xs flex items-center gap-1 flex-wrap"
              style={{ color: 'var(--ink-light)' }}
            >
              <User size={11} />
              {task.assignees.map((name) => (
                <span
                  key={name}
                  className="flex items-center gap-1"
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: getMemberColor
                        ? getMemberColor(name)
                        : 'var(--ink-light)',
                      display: 'inline-block',
                    }}
                  />
                  {name}
                </span>
              ))}
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

      {onToggleCanvas && (
        <button
          className={`icon-btn ${
            isOnCanvas ? 'active' : ''
          }`}
          title={
            isOnCanvas
              ? 'Retirer du canvas'
              : 'Ajouter au canvas'
          }
          onClick={() => onToggleCanvas(task)}
        >
          <Workflow size={14} />
        </button>
      )}

      {onEdit && (
        <button
          className="icon-btn"
          onClick={() => onEdit(task)}
        >
          <Pencil size={14} />
        </button>
      )}

      <button
        className="icon-btn"
        onClick={() => onDelete(task.id)}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function ProjectCard({
  project,
  tasks,
  getMemberColor,
  onClick,
}) {
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

      {project.assignees && project.assignees.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {project.assignees.map((name) => (
            <span
              key={name}
              className="text-xs flex items-center gap-1"
              style={{ color: 'var(--ink-light)' }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: getMemberColor
                    ? getMemberColor(name)
                    : 'var(--ink-light)',
                  display: 'inline-block',
                }}
              />
              {name}
            </span>
          ))}
        </div>
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

function MemberMultiSelect({ users, selected, onChange }) {
  function toggle(name) {
    if (selected.includes(name)) {
      onChange(
        selected.filter((n) => n !== name)
      );
    } else {
      onChange([...selected, name]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {users.map((user) => {
        const active = selected.includes(
          user.displayName
        );

        return (
          <button
            type="button"
            key={user.username}
            className="pill"
            onClick={() =>
              toggle(user.displayName)
            }
            style={{
              background: active
                ? 'var(--pitch-dark)'
                : 'var(--chalk)',
              color: active
                ? 'var(--white)'
                : 'var(--ink)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {user.displayName}
          </button>
        );
      })}
    </div>
  );
}

function ProjectFormModal({
  initial,
  users,
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

  const [assignees, setAssignees] = useState(
    initial?.assignees || []
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
      assignees,
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

          <div>
            <label>Assignés</label>

            <MemberMultiSelect
              users={users}
              selected={assignees}
              onChange={setAssignees}
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

  const [assignees, setAssignees] = useState(
    defaultAssignee ? [defaultAssignee] : []
  );

  function submit() {
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      dueDate,
      assignees: assignees.length
        ? assignees
        : defaultAssignee
        ? [defaultAssignee]
        : [],
    });

    setTitle('');
    setDueDate('');
  }

  return (
    <div
      className="mt-3"
      style={{
        paddingTop: 12,
        borderTop: '1px dashed var(--line)',
      }}
    >
      <div className="flex flex-col sm:flex-row gap-2">
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

        <button
          className="btn-primary"
          onClick={submit}
        >
          <Plus size={14} />
          Ajouter
        </button>
      </div>

      <div className="mt-2">
        <MemberMultiSelect
          users={users}
          selected={assignees}
          onChange={setAssignees}
        />
      </div>
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

function TaskEditModal({
  task,
  users,
  comments,
  taskDocuments,
  linkableDocuments,
  getDocumentUrl,
  taskCost,
  onOpenCostForm,
  onRemoveCost,
  onSave,
  onAddComment,
  onLinkDocument,
  onUnlinkDocument,
  onOpenDocumentUpload,
  onCancel,
}) {
  const [title, setTitle] = useState(
    task.title || ''
  );

  const [dueDate, setDueDate] = useState(
    task.dueDate || ''
  );

  const [status, setStatus] = useState(
    task.status || 'a_venir'
  );

  const [assignees, setAssignees] = useState(
    task.assignees || []
  );

  const [commentText, setCommentText] =
    useState('');

  const [linkDocId, setLinkDocId] = useState('');

  const [error, setError] = useState('');

  function submit() {
    if (!title.trim()) {
      setError('Le titre est obligatoire.');
      return;
    }

    onSave(task.id, {
      title: title.trim(),
      dueDate,
      status,
      assignees,
    });
  }

  function submitComment() {
    if (!commentText.trim()) return;

    onAddComment(task.id, commentText.trim());

    setCommentText('');
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-card"
        style={{ maxWidth: 480 }}
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
          Modifier la tâche
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
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label>Échéance</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div>
              <label>Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="a_venir">À venir</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
              </select>
            </div>
          </div>

          <div>
            <label>Assignés</label>
            <MemberMultiSelect
              users={users}
              selected={assignees}
              onChange={setAssignees}
            />
          </div>

          {error && (
            <p className="text-xs" style={{ color: 'var(--red)' }}>
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button className="btn-secondary" onClick={onCancel}>
            Annuler
          </button>

          <button className="btn-primary" onClick={submit}>
            Enregistrer
          </button>
        </div>

        <div
          className="mt-5"
          style={{
            paddingTop: 14,
            borderTop: '1px solid var(--line)',
          }}
        >
          <h4 className="font-display text-sm">
            Commentaires
          </h4>

          <div
            className="mt-2"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              maxHeight: 180,
              overflowY: 'auto',
            }}
          >
            {comments.length === 0 ? (
              <p
                className="text-xs"
                style={{ color: 'var(--ink-light)' }}
              >
                Aucun commentaire pour l'instant.
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    background: 'var(--chalk)',
                    borderRadius: 8,
                    padding: '6px 10px',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: 'var(--ink)' }}
                    >
                      {comment.author}
                    </span>

                    <span
                      className="text-xs"
                      style={{ color: 'var(--ink-light)' }}
                    >
                      {formatTime(
                        new Date(comment.createdAt)
                      )}
                    </span>
                  </div>

                  <p
                    className="text-sm mt-1"
                    style={{ color: 'var(--ink)' }}
                  >
                    {comment.text}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <input
              style={{ flex: 1 }}
              placeholder="Ajouter un commentaire ou un message de fin…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' && submitComment()
              }
            />

            <button
              className="btn-secondary"
              onClick={submitComment}
            >
              Publier
            </button>
          </div>
        </div>

        <div
          className="mt-5"
          style={{
            paddingTop: 14,
            borderTop: '1px solid var(--line)',
          }}
        >
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm">
              Documents
            </h4>

            {onOpenDocumentUpload && (
              <button
                className="btn-secondary"
                onClick={onOpenDocumentUpload}
              >
                <Upload size={12} />
                Ajouter
              </button>
            )}
          </div>

          {taskDocuments.length === 0 ? (
            <p
              className="text-xs mt-2"
              style={{ color: 'var(--ink-light)' }}
            >
              Aucun document lié.
            </p>
          ) : (
            <div className="mt-2">
              {taskDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-2 py-1"
                >
                  <FileText size={13} />

                  <a
                    className="text-sm flex-1 min-w-0 truncate"
                    href={getDocumentUrl(doc)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--ink)' }}
                  >
                    {doc.name}
                  </a>

                  <button
                    className="icon-btn"
                    title="Délier de la tâche"
                    onClick={() =>
                      onUnlinkDocument(doc.id)
                    }
                  >
                    <Unlink size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {linkableDocuments.length > 0 && (
            <div className="flex gap-2 mt-2">
              <select
                style={{ flex: 1 }}
                value={linkDocId}
                onChange={(e) =>
                  setLinkDocId(e.target.value)
                }
              >
                <option value="">
                  Lier un document du projet…
                </option>
                {linkableDocuments.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>

              <button
                className="btn-secondary"
                disabled={!linkDocId}
                onClick={() => {
                  onLinkDocument(linkDocId);
                  setLinkDocId('');
                }}
              >
                <Link2 size={12} />
                Lier
              </button>
            </div>
          )}
        </div>

        <div
          className="mt-5"
          style={{
            paddingTop: 14,
            borderTop: '1px solid var(--line)',
          }}
        >
          <h4 className="font-display text-sm">
            Finance
          </h4>

          {taskCost ? (
            <div className="flex items-center justify-between mt-2">
              <span
                className="text-sm"
                style={{
                  color: 'var(--red)',
                  fontWeight: 600,
                }}
              >
                - {formatCurrency(taskCost.amount)}
              </span>

              <div className="flex gap-2">
                <button
                  className="icon-btn"
                  onClick={() =>
                    onOpenCostForm(taskCost)
                  }
                >
                  <Pencil size={12} />
                </button>

                <button
                  className="icon-btn"
                  onClick={() =>
                    onRemoveCost(taskCost.id)
                  }
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn-secondary mt-2"
              onClick={() => onOpenCostForm(null)}
            >
              <Wallet size={12} />
              Ajouter un coût
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DocumentPlacementFields({
  folders,
  projects,
  tasks,
  folderId,
  setFolderId,
  projectId,
  setProjectId,
  taskId,
  setTaskId,
}) {
  const projectTasks = projectId
    ? tasks.filter((t) => t.projectId === projectId)
    : [];

  return (
    <>
      <div>
        <label>Dossier</label>
        <select
          value={folderId || ''}
          onChange={(e) =>
            setFolderId(e.target.value || null)
          }
        >
          <option value="">Non classé</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Projet (optionnel)</label>
        <select
          value={projectId || ''}
          onChange={(e) => {
            setProjectId(e.target.value || null);
            setTaskId(null);
          }}
        >
          <option value="">Aucun projet</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {projectId && (
        <div>
          <label>Tâche (optionnel)</label>
          <select
            value={taskId || ''}
            onChange={(e) =>
              setTaskId(e.target.value || null)
            }
          >
            <option value="">Aucune tâche</option>
            {projectTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}

function FolderFormModal({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function submit() {
    if (!name.trim()) {
      setError('Le nom est obligatoire.');
      return;
    }

    onSubmit(name.trim());
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
          Nouveau dossier
        </h3>

        <div className="mt-4">
          <label>Nom du dossier</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            placeholder="Ex. Trésorerie"
            onKeyDown={(e) =>
              e.key === 'Enter' && submit()
            }
          />

          {error && (
            <p
              className="text-xs mt-1"
              style={{ color: 'var(--red)' }}
            >
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-secondary" onClick={onCancel}>
            Annuler
          </button>

          <button className="btn-primary" onClick={submit}>
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentUploadModal({
  folders,
  projects,
  tasks,
  initialFolderId,
  initialProjectId,
  initialTaskId,
  onSubmit,
  onCancel,
}) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [folderId, setFolderId] = useState(
    initialFolderId || null
  );
  const [projectId, setProjectId] = useState(
    initialProjectId || null
  );
  const [taskId, setTaskId] = useState(
    initialTaskId || null
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function handleFileChange(e) {
    const selected = e.target.files?.[0];

    if (!selected) return;

    if (selected.size > MAX_DOCUMENT_SIZE) {
      setError('Le fichier dépasse 50 Mo.');
      return;
    }

    setError('');
    setFile(selected);

    if (!name) {
      setName(selected.name);
    }
  }

  async function submit() {
    if (!file) {
      setError('Choisis un fichier.');
      return;
    }

    if (!name.trim()) {
      setError('Le nom est obligatoire.');
      return;
    }

    setBusy(true);

    await onSubmit({
      file,
      name: name.trim(),
      folderId,
      projectId,
      taskId,
    });

    setBusy(false);
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
          Ajouter un document
        </h3>

        <div
          className="mt-4"
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div>
            <label>Fichier (50 Mo max)</label>
            <input
              type="file"
              onChange={handleFileChange}
            />
          </div>

          <div>
            <label>Nom affiché</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Règlement intérieur"
            />
          </div>

          <DocumentPlacementFields
            folders={folders}
            projects={projects}
            tasks={tasks}
            folderId={folderId}
            setFolderId={setFolderId}
            projectId={projectId}
            setProjectId={setProjectId}
            taskId={taskId}
            setTaskId={setTaskId}
          />

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

          <button
            className="btn-primary"
            onClick={submit}
            disabled={busy}
          >
            {busy ? 'Envoi…' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentReclassifyModal({
  document,
  folders,
  projects,
  tasks,
  onSubmit,
  onCancel,
}) {
  const [folderId, setFolderId] = useState(
    document.folderId
  );
  const [projectId, setProjectId] = useState(
    document.projectId
  );
  const [taskId, setTaskId] = useState(
    document.taskId
  );

  function submit() {
    onSubmit(document.id, {
      folderId,
      projectId,
      taskId,
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
          Ranger "{document.name}"
        </h3>

        <div
          className="mt-4"
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <DocumentPlacementFields
            folders={folders}
            projects={projects}
            tasks={tasks}
            folderId={folderId}
            setFolderId={setFolderId}
            projectId={projectId}
            setProjectId={setProjectId}
            taskId={taskId}
            setTaskId={setTaskId}
          />
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-secondary" onClick={onCancel}>
            Annuler
          </button>

          <button className="btn-primary" onClick={submit}>
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentRow({
  doc,
  folders,
  projects,
  getDocumentUrl,
  onReclassify,
  onDelete,
  compact,
}) {
  const folder = folders.find(
    (f) => f.id === doc.folderId
  );

  const project = projects.find(
    (p) => p.id === doc.projectId
  );

  const extension = (
    doc.name.split('.').pop() || ''
  ).toUpperCase();

  return (
    <div
      className="flex items-center gap-3 py-2"
      style={{ borderBottom: '1px solid var(--line)' }}
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
        <FileText size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {doc.name}
        </p>

        <div className="flex items-center gap-2 flex-wrap mt-1">
          <span
            className="text-xs"
            style={{ color: 'var(--ink-light)' }}
          >
            {extension} · {formatBytes(doc.size)}
          </span>

          {!compact && folder && (
            <span
              className="pill"
              style={{
                background: 'var(--chalk)',
                color: 'var(--ink-light)',
              }}
            >
              <Folder size={10} />
              {folder.name}
            </span>
          )}

          {!compact && project && (
            <span
              className="pill"
              style={{
                background: 'var(--chalk)',
                color: 'var(--ink-light)',
              }}
            >
              {project.name}
            </span>
          )}
        </div>
      </div>

      <a
        className="icon-btn"
        href={getDocumentUrl(doc)}
        target="_blank"
        rel="noreferrer"
      >
        <ExternalLink size={14} />
      </a>

      {onReclassify && (
        <button
          className="icon-btn"
          onClick={() => onReclassify(doc)}
        >
          <Pencil size={14} />
        </button>
      )}

      {onDelete && (
        <button
          className="icon-btn"
          onClick={() => onDelete(doc)}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

function TransactionRow({
  transaction,
  projects,
  tasks,
  documents,
  getDocumentUrl,
  onEdit,
  onDelete,
}) {
  const project = projects.find(
    (p) => p.id === transaction.projectId
  );

  const task = tasks.find(
    (t) => t.id === transaction.taskId
  );

  const doc = documents.find(
    (d) => d.id === transaction.documentId
  );

  const isIn = transaction.type === 'in';

  return (
    <div
      className="flex items-center gap-3 py-2"
      style={{ borderBottom: '1px solid var(--line)' }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: isIn
            ? '#E3EEE8'
            : 'var(--red-tint)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isIn ? (
          <TrendingUp size={16} color="#2D6A4F" />
        ) : (
          <TrendingDown
            size={16}
            color="var(--red)"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {transaction.reason}
        </p>

        <div className="flex items-center gap-2 flex-wrap mt-1">
          <span
            className="text-xs"
            style={{ color: 'var(--ink-light)' }}
          >
            {formatDateFR(
              transaction.createdAt.slice(0, 10)
            )}
          </span>

          {project && (
            <span
              className="pill"
              style={{
                background: 'var(--chalk)',
                color: 'var(--ink-light)',
              }}
            >
              {project.name}
            </span>
          )}

          {task && (
            <span
              className="pill"
              style={{
                background: 'var(--chalk)',
                color: 'var(--ink-light)',
              }}
            >
              {task.title}
            </span>
          )}

          {doc && (
            <a
              href={getDocumentUrl(doc)}
              target="_blank"
              rel="noreferrer"
              className="text-xs flex items-center gap-1"
              style={{ color: 'var(--ink-light)' }}
            >
              <Receipt size={11} />
              Justificatif
            </a>
          )}
        </div>
      </div>

      <span
        className="score"
        style={{
          fontSize: 16,
          color: isIn
            ? '#2D6A4F'
            : 'var(--red)',
        }}
      >
        {isIn ? '+' : '-'}
        {formatCurrency(transaction.amount)}
      </span>

      <button
        className="icon-btn"
        onClick={() => onEdit(transaction)}
      >
        <Pencil size={14} />
      </button>

      <button
        className="icon-btn"
        onClick={() => onDelete(transaction)}
      >
        <Trash2 size={14} />
      </button>
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
  eventsByDate,
  getProjectColor,
  getMemberColor,
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

          const dayEvents =
            eventsByDate[cell.iso] || [];

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

              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 flex-wrap justify-center mt-0.5">
                  {dayEvents
                    .slice(0, 3)
                    .map((event) => (
                      <span
                        key={event.id}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 2,
                          background:
                            getMemberColor(
                              event.assignee
                            ),
                        }}
                      />
                    ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MemberLegend({
  users,
  getMemberColor,
  filterMember,
  onSelect,
}) {
  if (!users.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {filterMember && (
        <button
          type="button"
          className="pill"
          style={{
            background: 'var(--ink)',
            color: 'var(--white)',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={() => onSelect(null)}
        >
          Tous
        </button>
      )}

      {users.map((user) => {
        const active =
          filterMember === user.displayName;

        return (
          <button
            type="button"
            key={user.username}
            className="pill"
            style={{
              background: active
                ? getMemberColor(user.displayName)
                : 'var(--chalk)',
              color: active
                ? 'var(--white)'
                : 'var(--ink)',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() =>
              onSelect(
                active ? null : user.displayName
              )
            }
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: active
                  ? 'var(--white)'
                  : getMemberColor(user.displayName),
                display: 'inline-block',
              }}
            />
            {user.displayName}
          </button>
        );
      })}
    </div>
  );
}

function WeekView({
  weekAnchor,
  tasksByDate,
  eventsByDate,
  getProjectColor,
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
          const dayTasks = tasksByDate[day.iso] || [];
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

              {dayTasks.length > 0 && (
                <div
                  className="mt-2"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      style={{
                        borderLeft: `3px solid ${getProjectColor(
                          task.projectId
                        )}`,
                        background: 'var(--chalk)',
                        borderRadius: 6,
                        padding: '4px 6px',
                      }}
                    >
                      <p
                        className="text-xs font-medium"
                        style={{ color: 'var(--ink)' }}
                      >
                        {task.title}
                      </p>

                      <p
                        className="text-xs"
                        style={{ color: 'var(--ink-light)' }}
                      >
                        {(task.assignees || []).join(
                          ', '
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}

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

function RadarChart({ data, size = 260 }) {
  const center = size / 2;
  const maxRadius = size / 2 - 44;
  const levels = 5;
  const angleStep = (2 * Math.PI) / data.length;

  function pointFor(index, value) {
    const angle = -Math.PI / 2 + index * angleStep;
    const r = (value / 5) * maxRadius;

    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  }

  const dataPoints = data.map((d, i) =>
    pointFor(i, d.value)
  );

  const dataPath = dataPoints
    .map((p) => `${p.x},${p.y}`)
    .join(' ');

  const gridPolygons = Array.from(
    { length: levels },
    (_, levelIdx) => {
      const levelValue =
        ((levelIdx + 1) / levels) * 5;

      return data
        .map((_, i) => pointFor(i, levelValue))
        .map((p) => `${p.x},${p.y}`)
        .join(' ');
    }
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      {gridPolygons.map((poly, i) => (
        <polygon
          key={i}
          points={poly}
          fill="none"
          stroke="var(--line)"
          strokeWidth="1"
        />
      ))}

      {data.map((_, i) => {
        const outer = pointFor(i, 5);

        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={outer.x}
            y2={outer.y}
            stroke="var(--line)"
            strokeWidth="1"
          />
        );
      })}

      <polygon
        points={dataPath}
        fill="var(--pitch)"
        fillOpacity="0.35"
        stroke="var(--pitch-dark)"
        strokeWidth="2"
      />

      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3"
          fill="var(--pitch-dark)"
        />
      ))}

      {data.map((d, i) => {
        const labelPoint = pointFor(i, 6.4);

        return (
          <text
            key={i}
            x={labelPoint.x}
            y={labelPoint.y}
            fontSize="11"
            fontWeight="600"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--ink)"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          onClick={() => onChange(n)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 2,
          }}
        >
          <Star
            size={18}
            fill={
              n <= value ? 'var(--pitch)' : 'none'
            }
            color={
              n <= value
                ? 'var(--pitch)'
                : 'var(--line)'
            }
          />
        </button>
      ))}
    </div>
  );
}

function PlayerFormModal({ onSubmit, onCancel }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [category, setCategory] = useState(
    PLAYER_CATEGORIES[0]
  );
  const [error, setError] = useState('');

  function submit() {
    if (!firstName.trim() || !lastName.trim()) {
      setError(
        'Le nom et le prénom sont obligatoires.'
      );
      return;
    }

    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      age: age ? Number(age) : null,
      category,
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
          Nouveau joueur
        </h3>

        <div
          className="mt-4"
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label>Prénom</label>
              <input
                value={firstName}
                onChange={(e) =>
                  setFirstName(e.target.value)
                }
                autoFocus
              />
            </div>

            <div>
              <label>Nom</label>
              <input
                value={lastName}
                onChange={(e) =>
                  setLastName(e.target.value)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label>Âge</label>
              <input
                type="number"
                min="0"
                value={age}
                onChange={(e) =>
                  setAge(e.target.value)
                }
              />
            </div>

            <div>
              <label>Catégorie</label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
              >
                {PLAYER_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
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

          <button className="btn-primary" onClick={submit}>
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}

function EvaluationFormModal({
  player,
  onSubmit,
  onCancel,
}) {
  const [scores, setScores] = useState({});
  const [busy, setBusy] = useState(false);

  function setScore(subId, value) {
    setScores((prev) => ({
      ...prev,
      [subId]: value,
    }));
  }

  const allRated = EVAL_THEMES.every((theme) =>
    theme.subcategories.every(
      (sub) => scores[sub.id]
    )
  );

  async function submit() {
    setBusy(true);
    await onSubmit(scores);
    setBusy(false);
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-card"
        style={{
          maxWidth: 560,
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
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
          Nouvelle évaluation
        </h3>

        <p
          className="text-sm"
          style={{ color: 'var(--ink-light)' }}
        >
          {player.firstName} {player.lastName} ·{' '}
          {player.category}
        </p>

        {EVAL_THEMES.map((theme) => (
          <div key={theme.id} className="mt-4">
            <h4 className="font-display text-sm">
              {theme.label}
            </h4>

            <div
              style={{
                borderTop: '1px solid var(--line)',
                marginTop: 4,
              }}
            >
              {theme.subcategories.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between py-2"
                  style={{
                    borderBottom:
                      '1px solid var(--line)',
                  }}
                >
                  <span className="text-sm">
                    {sub.label}
                  </span>

                  <StarPicker
                    value={scores[sub.id] || 0}
                    onChange={(v) =>
                      setScore(sub.id, v)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {!allRated && (
          <p
            className="text-xs mt-3"
            style={{ color: 'var(--ink-light)' }}
          >
            Note chaque sous-catégorie pour
            enregistrer l'évaluation.
          </p>
        )}

        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-secondary" onClick={onCancel}>
            Annuler
          </button>

          <button
            className="btn-primary"
            onClick={submit}
            disabled={busy || !allRated}
          >
            {busy
              ? 'Enregistrement…'
              : "Enregistrer l'évaluation"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DonutChart({ totalIn, totalOut, size = 160 }) {
  const total = totalIn + totalOut;
  const center = size / 2;
  const radius = size / 2 - 14;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  const inFraction =
    total > 0 ? totalIn / total : 0;
  const inLength = inFraction * circumference;
  const balance = totalIn - totalOut;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={
          total > 0 ? 'var(--red)' : 'var(--line)'
        }
        strokeWidth={strokeWidth}
      />

      {total > 0 && (
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#2D6A4F"
          strokeWidth={strokeWidth}
          strokeDasharray={`${inLength} ${
            circumference - inLength
          }`}
          transform={`rotate(-90 ${center} ${center})`}
        />
      )}

      <text
        x={center}
        y={center - 4}
        textAnchor="middle"
        fontSize="15"
        fontWeight="700"
        fill={
          balance >= 0
            ? 'var(--pitch-dark)'
            : 'var(--red)'
        }
      >
        {formatCurrency(balance)}
      </text>

      <text
        x={center}
        y={center + 14}
        textAnchor="middle"
        fontSize="10"
        fill="var(--ink-light)"
      >
        Solde
      </text>
    </svg>
  );
}

function TransactionFormModal({
  existing,
  initialProjectId,
  initialTaskId,
  initialType,
  projects,
  tasks,
  onSubmit,
  onCancel,
}) {
  const [type, setType] = useState(
    existing?.type || initialType || 'out'
  );

  const [amount, setAmount] = useState(
    existing ? String(existing.amount) : ''
  );

  const [reason, setReason] = useState(
    existing?.reason || ''
  );

  const [projectId, setProjectId] = useState(
    existing?.projectId ||
      initialProjectId ||
      null
  );

  const [taskId, setTaskId] = useState(
    existing?.taskId || initialTaskId || null
  );

  const [file, setFile] = useState(null);
  const [removeDocument, setRemoveDocument] =
    useState(false);

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const projectTasks = projectId
    ? tasks.filter(
        (t) => t.projectId === projectId
      )
    : [];

  async function submit() {
    const numericAmount = Number(
      amount.replace(',', '.')
    );

    if (!reason.trim()) {
      setError('La cause du mouvement est obligatoire.');
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setError('Le montant doit être supérieur à 0.');
      return;
    }

    setBusy(true);

    await onSubmit({
      type,
      amount: numericAmount,
      reason: reason.trim(),
      projectId,
      taskId,
      file,
      removeDocument,
    });

    setBusy(false);
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
          {existing
            ? 'Modifier le mouvement'
            : 'Nouveau mouvement'}
        </h3>

        <div
          className="mt-4"
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary"
              style={{
                flex: 1,
                background:
                  type === 'in'
                    ? '#2D6A4F'
                    : 'var(--white)',
                color:
                  type === 'in'
                    ? 'var(--white)'
                    : 'var(--ink)',
              }}
              onClick={() => setType('in')}
            >
              <TrendingUp size={14} />
              Rentrée
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{
                flex: 1,
                background:
                  type === 'out'
                    ? 'var(--red)'
                    : 'var(--white)',
                color:
                  type === 'out'
                    ? 'var(--white)'
                    : 'var(--ink)',
              }}
              onClick={() => setType('out')}
            >
              <TrendingDown size={14} />
              Dépense
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label>Montant (€)</label>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                placeholder="Ex. 45.90"
              />
            </div>

            <div>
              <label>Cause du mouvement</label>
              <input
                value={reason}
                onChange={(e) =>
                  setReason(e.target.value)
                }
                placeholder="Ex. Achat ballons"
              />
            </div>
          </div>

          <div>
            <label>Projet (optionnel)</label>
            <select
              value={projectId || ''}
              onChange={(e) => {
                setProjectId(
                  e.target.value || null
                );
                setTaskId(null);
              }}
            >
              <option value="">Aucun projet</option>
              {projects.map((project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {projectId && (
            <div>
              <label>Tâche (optionnel)</label>
              <select
                value={taskId || ''}
                onChange={(e) =>
                  setTaskId(
                    e.target.value || null
                  )
                }
              >
                <option value="">
                  Aucune tâche
                </option>
                {projectTasks.map((task) => (
                  <option
                    key={task.id}
                    value={task.id}
                  >
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label>
              Justificatif (facture, reçu…)
            </label>

            {existing?.documentId &&
            !removeDocument ? (
              <div className="flex items-center justify-between">
                <span
                  className="text-xs flex items-center gap-1"
                  style={{
                    color: 'var(--ink-light)',
                  }}
                >
                  <Receipt size={12} />
                  Document déjà attaché
                </span>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    setRemoveDocument(true)
                  }
                >
                  Retirer
                </button>
              </div>
            ) : (
              <input
                type="file"
                onChange={(e) =>
                  setFile(
                    e.target.files?.[0] || null
                  )
                }
              />
            )}
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

          <button
            className="btn-primary"
            onClick={submit}
            disabled={busy}
          >
            {busy ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CANVAS DE WORKFLOW
========================================================= */

const WORKFLOW_ZOOM_MIN = 0.4;
const WORKFLOW_ZOOM_MAX = 2.5;
const WORKFLOW_CANVAS_W = 4000;
const WORKFLOW_CANVAS_H = 3000;

function clipToBox(cx, cy, halfW, halfH, dx, dy) {
  if (dx === 0 && dy === 0) return { x: cx, y: cy };

  const scaleX =
    dx !== 0 ? halfW / Math.abs(dx) : Infinity;

  const scaleY =
    dy !== 0 ? halfH / Math.abs(dy) : Infinity;

  const scale = Math.min(scaleX, scaleY);

  return { x: cx + dx * scale, y: cy + dy * scale };
}

function WorkflowCanvas({
  nodes,
  edges,
  tasksById,
  getMemberColor,
  onMoveNode,
  onAddEdge,
  onDeleteEdge,
  onRemoveNode,
  onUpdateNoteContent,
  onAddNote,
}) {
  const wrapRef = useRef(null);
  const nodeElRefs = useRef({});

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 60, y: 40 });
  const [nodeSizes, setNodeSizes] = useState({});
  const [dragNode, setDragNode] = useState(null);
  const [livePositions, setLivePositions] = useState(
    {}
  );
  const [panState, setPanState] = useState(null);
  const [connectFrom, setConnectFrom] = useState(null);
  const [pointer, setPointer] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] =
    useState(null);
  const [editingNoteId, setEditingNoteId] =
    useState(null);
  const [noteDraft, setNoteDraft] = useState('');

  const stateRef = useRef({});

  stateRef.current = {
    dragNode,
    connectFrom,
    zoom,
    pan,
    edges,
    panState,
  };

  useEffect(() => {
    const next = {};
    let changed =
      Object.keys(nodeSizes).length !== nodes.length;

    nodes.forEach((n) => {
      const el = nodeElRefs.current[n.id];
      const w = el ? el.offsetWidth : 200;
      const h = el ? el.offsetHeight : 70;

      next[n.id] = { w, h };

      const prev = nodeSizes[n.id];

      if (!prev || prev.w !== w || prev.h !== h) {
        changed = true;
      }
    });

    if (changed) setNodeSizes(next);
    // eslint-disable-next-line
  }, [nodes]);

  function getPos(node) {
    return (
      livePositions[node.id] || {
        x: node.posX,
        y: node.posY,
      }
    );
  }

  function getBox(node) {
    const pos = getPos(node);
    const size = nodeSizes[node.id] || { w: 200, h: 70 };

    return {
      cx: pos.x + size.w / 2,
      cy: pos.y + size.h / 2,
      halfW: size.w / 2,
      halfH: size.h / 2,
    };
  }

  function zoomBy(factor) {
    const rect = wrapRef.current.getBoundingClientRect();
    const cursorX = rect.width / 2;
    const cursorY = rect.height / 2;
    const canvasX = (cursorX - pan.x) / zoom;
    const canvasY = (cursorY - pan.y) / zoom;

    const nextZoom = Math.min(
      WORKFLOW_ZOOM_MAX,
      Math.max(WORKFLOW_ZOOM_MIN, zoom * factor)
    );

    setPan({
      x: cursorX - canvasX * nextZoom,
      y: cursorY - canvasY * nextZoom,
    });

    setZoom(nextZoom);
  }

  function resetView() {
    setZoom(1);
    setPan({ x: 60, y: 40 });
  }

  function handleCanvasMouseDown(e) {
    if (
      e.target.closest('[data-workflow-node-id]') ||
      e.target.closest('.workflow-edge-hit') ||
      e.target.closest('.workflow-edge-delete')
    ) {
      return;
    }

    setSelectedEdgeId(null);

    setPanState({
      startClientX: e.clientX,
      startClientY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    });
  }

  function handleNodeMouseDown(e, node) {
    e.stopPropagation();
    setSelectedEdgeId(null);

    const pos = getPos(node);

    setDragNode({
      id: node.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: pos.x,
      startY: pos.y,
    });
  }

  function handleHandleMouseDown(e, node) {
    e.stopPropagation();

    const rect = wrapRef.current.getBoundingClientRect();

    setConnectFrom(node.id);

    setPointer({
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    });
  }

  useEffect(() => {
    function handleMouseMove(e) {
      const { dragNode, connectFrom, zoom, panState } =
        stateRef.current;

      if (dragNode) {
        const dx =
          (e.clientX - dragNode.startClientX) / zoom;

        const dy =
          (e.clientY - dragNode.startClientY) / zoom;

        setLivePositions((prev) => ({
          ...prev,
          [dragNode.id]: {
            x: dragNode.startX + dx,
            y: dragNode.startY + dy,
          },
        }));
      }

      if (panState) {
        setPan({
          x:
            panState.startPanX +
            (e.clientX - panState.startClientX),
          y:
            panState.startPanY +
            (e.clientY - panState.startClientY),
        });
      }

      if (connectFrom && wrapRef.current) {
        const rect =
          wrapRef.current.getBoundingClientRect();

        const { pan, zoom } = stateRef.current;

        setPointer({
          x: (e.clientX - rect.left - pan.x) / zoom,
          y: (e.clientY - rect.top - pan.y) / zoom,
        });
      }
    }

    function handleMouseUp(e) {
      const { dragNode, connectFrom, zoom, edges } =
        stateRef.current;

      if (dragNode) {
        const dx =
          (e.clientX - dragNode.startClientX) / zoom;

        const dy =
          (e.clientY - dragNode.startClientY) / zoom;

        onMoveNode(
          dragNode.id,
          dragNode.startX + dx,
          dragNode.startY + dy
        );

        setLivePositions((prev) => {
          const next = { ...prev };
          delete next[dragNode.id];
          return next;
        });

        setDragNode(null);
      }

      if (connectFrom) {
        const targetEl = document
          .elementFromPoint(e.clientX, e.clientY)
          ?.closest('[data-workflow-node-id]');

        const targetId = targetEl?.getAttribute(
          'data-workflow-node-id'
        );

        if (targetId && targetId !== connectFrom) {
          const exists = edges.some(
            (ed) =>
              (ed.sourceId === connectFrom &&
                ed.targetId === targetId) ||
              (ed.sourceId === targetId &&
                ed.targetId === connectFrom)
          );

          if (!exists) {
            onAddEdge(connectFrom, targetId);
          }
        }

        setConnectFrom(null);
        setPointer(null);
      }

      setPanState(null);
    }

    window.addEventListener(
      'mousemove',
      handleMouseMove
    );

    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener(
        'mousemove',
        handleMouseMove
      );

      window.removeEventListener(
        'mouseup',
        handleMouseUp
      );
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    function onWheelNative(e) {
      e.preventDefault();

      const { zoom, pan } = stateRef.current;
      const rect = el.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      const canvasX = (cursorX - pan.x) / zoom;
      const canvasY = (cursorY - pan.y) / zoom;

      const nextZoom = Math.min(
        WORKFLOW_ZOOM_MAX,
        Math.max(
          WORKFLOW_ZOOM_MIN,
          zoom * (1 - e.deltaY * 0.0015)
        )
      );

      setPan({
        x: cursorX - canvasX * nextZoom,
        y: cursorY - canvasY * nextZoom,
      });

      setZoom(nextZoom);
    }

    el.addEventListener('wheel', onWheelNative, {
      passive: false,
    });

    return () =>
      el.removeEventListener('wheel', onWheelNative);
  }, []);

  return (
    <div className="workflow-canvas-block">
      <div className="workflow-toolbar">
        <button
          className="icon-btn"
          onClick={() => zoomBy(1 / 1.2)}
          title="Zoom arrière"
        >
          <ZoomOut size={14} />
        </button>

        <span className="workflow-zoom-label">
          {Math.round(zoom * 100)}%
        </span>

        <button
          className="icon-btn"
          onClick={() => zoomBy(1.2)}
          title="Zoom avant"
        >
          <ZoomIn size={14} />
        </button>

        <button
          className="icon-btn"
          onClick={resetView}
          title="Réinitialiser la vue"
        >
          <Maximize size={14} />
        </button>

        <div className="workflow-toolbar-divider" />

        <button
          className="btn-secondary"
          onClick={onAddNote}
        >
          <Type size={13} />
          Texte
        </button>
      </div>

      <div
        className="workflow-canvas"
        ref={wrapRef}
        onMouseDown={handleCanvasMouseDown}
        style={{
          cursor: panState ? 'grabbing' : 'grab',
        }}
      >
        <div
          className="workflow-inner"
          style={{
            width: WORKFLOW_CANVAS_W,
            height: WORKFLOW_CANVAS_H,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          <svg
            className="workflow-edges-svg"
            width={WORKFLOW_CANVAS_W}
            height={WORKFLOW_CANVAS_H}
          >
            <defs>
              <marker
                id="workflow-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path
                  d="M0,0 L8,4 L0,8 Z"
                  fill="var(--pitch-dark)"
                />
              </marker>
            </defs>

            {edges.map((edge) => {
              const source = nodes.find(
                (n) => n.id === edge.sourceId
              );

              const target = nodes.find(
                (n) => n.id === edge.targetId
              );

              if (!source || !target) return null;

              const a = getBox(source);
              const b = getBox(target);
              const dx = b.cx - a.cx;
              const dy = b.cy - a.cy;

              const start = clipToBox(
                a.cx,
                a.cy,
                a.halfW,
                a.halfH,
                dx,
                dy
              );

              const end = clipToBox(
                b.cx,
                b.cy,
                b.halfW,
                b.halfH,
                -dx,
                -dy
              );

              const midX = (start.x + end.x) / 2;
              const midY = (start.y + end.y) / 2;
              const selected =
                selectedEdgeId === edge.id;

              return (
                <g key={edge.id}>
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={
                      selected
                        ? 'var(--red)'
                        : 'var(--pitch-dark)'
                    }
                    strokeWidth={selected ? 2.5 : 2}
                    markerEnd="url(#workflow-arrow)"
                  />

                  <line
                    className="workflow-edge-hit"
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="transparent"
                    strokeWidth={16}
                    style={{
                      cursor: 'pointer',
                      pointerEvents: 'stroke',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEdgeId(edge.id);
                    }}
                  />

                  {selected && (
                    <foreignObject
                      x={midX - 12}
                      y={midY - 12}
                      width={24}
                      height={24}
                    >
                      <button
                        className="workflow-edge-delete"
                        onMouseDown={(e) =>
                          e.stopPropagation()
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEdge(edge.id);
                          setSelectedEdgeId(null);
                        }}
                      >
                        <X size={12} />
                      </button>
                    </foreignObject>
                  )}
                </g>
              );
            })}

            {connectFrom &&
              pointer &&
              (() => {
                const source = nodes.find(
                  (n) => n.id === connectFrom
                );

                if (!source) return null;

                const a = getBox(source);

                return (
                  <line
                    x1={a.cx}
                    y1={a.cy}
                    x2={pointer.x}
                    y2={pointer.y}
                    stroke="var(--amber)"
                    strokeWidth={2}
                    strokeDasharray="5,4"
                  />
                );
              })()}
          </svg>

          {nodes.map((node) => {
            const pos = getPos(node);

            if (node.kind === 'task') {
              const task = tasksById[node.taskId];

              return (
                <div
                  key={node.id}
                  data-workflow-node-id={node.id}
                  className={`workflow-node workflow-node-task ${
                    dragNode?.id === node.id
                      ? 'is-dragging'
                      : ''
                  }`}
                  ref={(el) => {
                    nodeElRefs.current[node.id] = el;
                  }}
                  style={{
                    left: pos.x,
                    top: pos.y,
                    borderLeftColor:
                      task &&
                      task.assignees &&
                      task.assignees[0]
                        ? getMemberColor(
                            task.assignees[0]
                          )
                        : 'var(--line)',
                  }}
                  onMouseDown={(e) =>
                    handleNodeMouseDown(e, node)
                  }
                >
                  <button
                    className="workflow-node-remove"
                    title="Retirer du canvas"
                    onMouseDown={(e) =>
                      e.stopPropagation()
                    }
                    onClick={() =>
                      onRemoveNode(node.id)
                    }
                  >
                    <X size={11} />
                  </button>

                  {task ? (
                    <>
                      <p className="workflow-node-title">
                        {task.title}
                      </p>

                      <div className="workflow-node-meta">
                        <StatusPill
                          status={task.status}
                        />

                        {task.dueDate && (
                          <span className="workflow-node-due">
                            {formatDateFR(
                              task.dueDate
                            )}
                          </span>
                        )}
                      </div>

                      {task.assignees &&
                        task.assignees.length >
                          0 && (
                          <div className="workflow-node-assignees">
                            {task.assignees.map(
                              (name) => (
                                <span
                                  key={name}
                                  className="workflow-node-assignee"
                                >
                                  <span
                                    className="dot"
                                    style={{
                                      background:
                                        getMemberColor(
                                          name
                                        ),
                                    }}
                                  />
                                  {name}
                                </span>
                              )
                            )}
                          </div>
                        )}
                    </>
                  ) : (
                    <p
                      className="text-xs"
                      style={{
                        color: 'var(--ink-light)',
                      }}
                    >
                      Tâche supprimée
                    </p>
                  )}

                  <div
                    className="workflow-node-handle"
                    title="Glisser pour relier à une autre bulle"
                    onMouseDown={(e) =>
                      handleHandleMouseDown(e, node)
                    }
                  />
                </div>
              );
            }

            return (
              <div
                key={node.id}
                data-workflow-node-id={node.id}
                className={`workflow-node workflow-node-note ${
                  dragNode?.id === node.id
                    ? 'is-dragging'
                    : ''
                }`}
                ref={(el) => {
                  nodeElRefs.current[node.id] = el;
                }}
                style={{ left: pos.x, top: pos.y }}
                onMouseDown={(e) =>
                  handleNodeMouseDown(e, node)
                }
              >
                <button
                  className="workflow-node-remove"
                  title="Supprimer la note"
                  onMouseDown={(e) =>
                    e.stopPropagation()
                  }
                  onClick={() =>
                    onRemoveNode(node.id)
                  }
                >
                  <X size={11} />
                </button>

                {editingNoteId === node.id ? (
                  <textarea
                    autoFocus
                    className="workflow-note-textarea"
                    value={noteDraft}
                    onMouseDown={(e) =>
                      e.stopPropagation()
                    }
                    onChange={(e) =>
                      setNoteDraft(e.target.value)
                    }
                    onBlur={() => {
                      onUpdateNoteContent(
                        node.id,
                        noteDraft
                      );
                      setEditingNoteId(null);
                    }}
                  />
                ) : (
                  <p
                    className="workflow-note-text"
                    onMouseDown={(e) =>
                      e.stopPropagation()
                    }
                    onClick={() => {
                      setEditingNoteId(node.id);
                      setNoteDraft(
                        node.content || ''
                      );
                    }}
                  >
                    {node.content ||
                      'Cliquez pour écrire…'}
                  </p>
                )}

                <div
                  className="workflow-node-handle"
                  title="Glisser pour relier à une autre bulle"
                  onMouseDown={(e) =>
                    handleHandleMouseDown(e, node)
                  }
                />
              </div>
            );
          })}
        </div>

        {nodes.length === 0 && (
          <div className="workflow-empty-hint">
            Cliquez sur l'icône{' '}
            <Workflow
              size={13}
              style={{ verticalAlign: 'middle' }}
            />{' '}
            sur une tâche ci-dessous pour l'ajouter à
            votre workflow.
          </div>
        )}
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

  const [workflowNodes, setWorkflowNodes] =
    useState([]);

  const [workflowEdges, setWorkflowEdges] =
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

  const [filterMember, setFilterMember] = useState(
    null
  );

  const [taskComments, setTaskComments] = useState(
    []
  );

  const [editingTask, setEditingTask] = useState(
    null
  );

  const [messages, setMessages] = useState([]);

  const [chatRoom, setChatRoom] = useState(
    'global'
  );

  const [chatDraft, setChatDraft] = useState('');

  const chatEndRef = useRef(null);

  const [docFolders, setDocFolders] = useState([]);

  const [documents, setDocuments] = useState([]);

  const [showFolderForm, setShowFolderForm] =
    useState(false);

  const [showDocumentUpload, setShowDocumentUpload] =
    useState(null);

  const [reclassifyDoc, setReclassifyDoc] = useState(
    null
  );

  const [docSearch, setDocSearch] = useState('');

  const [docSort, setDocSort] = useState('recent');

  const [docFolderFilter, setDocFolderFilter] =
    useState('all');

  const [players, setPlayers] = useState([]);

  const [evaluations, setEvaluations] = useState(
    []
  );

  const [showPlayerForm, setShowPlayerForm] =
    useState(false);

  const [selectedPlayerId, setSelectedPlayerId] =
    useState(null);

  const [showEvaluationForm, setShowEvaluationForm] =
    useState(false);

  const [viewingEvaluationId, setViewingEvaluationId] =
    useState(null);

  const [transactions, setTransactions] = useState(
    []
  );

  const [showTransactionForm, setShowTransactionForm] =
    useState(null);

  const [financeProjectFilter, setFinanceProjectFilter] =
    useState('all');

  const [openNavMenu, setOpenNavMenu] = useState(
    null
  );

  const [navMenuPos, setNavMenuPos] = useState({
    top: 0,
    left: 0,
  });

  const navCloseTimer = useRef(null);

  function cancelNavClose() {
    if (navCloseTimer.current) {
      clearTimeout(navCloseTimer.current);
      navCloseTimer.current = null;
    }
  }

  function scheduleNavClose() {
    cancelNavClose();
    navCloseTimer.current = setTimeout(() => {
      setOpenNavMenu(null);
    }, 150);
  }

  function openNavDropdown(item, triggerEl) {
    cancelNavClose();
    const rect = triggerEl.getBoundingClientRect();
    setNavMenuPos({
      top: rect.bottom,
      left: rect.left,
    });
    setOpenNavMenu(item.id);
  }

  useEffect(() => {
    if (!openNavMenu) return;
    function handleOutsideClick(e) {
      if (
        e.target.closest('.nav-dropdown') ||
        e.target.closest('.nav-dropdown-menu')
      ) {
        return;
      }
      setOpenNavMenu(null);
    }
    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );
    return () =>
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
  }, [openNavMenu]);

  const [chatDrawerOpen, setChatDrawerOpen] =
    useState(false);

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
        taskCommentsResult,
        messagesResult,
        docFoldersResult,
        documentsResult,
        playersResult,
        evaluationsResult,
        transactionsResult,
        workflowNodesResult,
        workflowEdgesResult,
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

        supabase
          .from('task_comments')
          .select('*')
          .order('created_at', {
            ascending: true,
          }),

        supabase
          .from('messages')
          .select('*')
          .order('created_at', {
            ascending: true,
          })
          .limit(500),

        supabase
          .from('doc_folders')
          .select('*')
          .order('name', {
            ascending: true,
          }),

        supabase
          .from('documents')
          .select('*')
          .order('created_at', {
            ascending: false,
          }),

        supabase
          .from('players')
          .select('*')
          .order('created_at', {
            ascending: true,
          }),

        supabase
          .from('evaluations')
          .select('*')
          .order('created_at', {
            ascending: true,
          }),

        supabase
          .from('transactions')
          .select('*')
          .order('created_at', {
            ascending: false,
          }),

        supabase
          .from('workflow_nodes')
          .select('*')
          .order('created_at', {
            ascending: true,
          }),

        supabase
          .from('workflow_edges')
          .select('*')
          .order('created_at', {
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

      if (taskCommentsResult.error)
        throw taskCommentsResult.error;

      if (messagesResult.error)
        throw messagesResult.error;

      if (docFoldersResult.error)
        throw docFoldersResult.error;

      if (documentsResult.error)
        throw documentsResult.error;

      if (playersResult.error)
        throw playersResult.error;

      if (evaluationsResult.error)
        throw evaluationsResult.error;

      if (transactionsResult.error)
        throw transactionsResult.error;

      if (workflowNodesResult.error)
        throw workflowNodesResult.error;

      if (workflowEdgesResult.error)
        throw workflowEdgesResult.error;

      setUsers(
        (usersResult.data || []).map(
          (u) => ({
            username: u.username,
            displayName:
              u.display_name,
            role: u.role,
            passwordHash:
              u.password_hash,
            lastSeen: u.last_seen,
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
            assignees:
              p.assignees || [],
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
            assignees:
              t.assignees || [],
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

      setTaskComments(
        (taskCommentsResult.data || []).map(
          (c) => ({
            id: c.id,
            taskId: c.task_id,
            author: c.author || '',
            text: c.text,
            createdAt: c.created_at,
          })
        )
      );

      setMessages(
        (messagesResult.data || []).map(
          mapMessageRow
        )
      );

      setDocFolders(
        (docFoldersResult.data || []).map(
          (f) => ({
            id: f.id,
            name: f.name,
            createdBy: f.created_by || '',
            createdAt: f.created_at,
          })
        )
      );

      setDocuments(
        (documentsResult.data || []).map(
          (d) => ({
            id: d.id,
            name: d.name,
            storagePath: d.storage_path,
            mimeType: d.mime_type || '',
            size: d.size || 0,
            folderId: d.folder_id,
            projectId: d.project_id,
            taskId: d.task_id,
            uploadedBy: d.uploaded_by || '',
            createdAt: d.created_at,
          })
        )
      );

      setPlayers(
        (playersResult.data || []).map(
          (p) => ({
            id: p.id,
            firstName: p.first_name,
            lastName: p.last_name,
            age: p.age,
            category: p.category,
            createdBy: p.created_by || '',
            createdAt: p.created_at,
          })
        )
      );

      setEvaluations(
        (evaluationsResult.data || []).map(
          (e) => ({
            id: e.id,
            playerId: e.player_id,
            scores: e.scores || {},
            evaluatedBy: e.evaluated_by || '',
            createdAt: e.created_at,
          })
        )
      );

      setTransactions(
        (transactionsResult.data || []).map(
          (t) => ({
            id: t.id,
            projectId: t.project_id,
            taskId: t.task_id,
            type: t.type,
            amount: Number(t.amount) || 0,
            reason: t.reason || '',
            documentId: t.document_id,
            createdBy: t.created_by || '',
            createdAt: t.created_at,
          })
        )
      );

      setWorkflowNodes(
        (workflowNodesResult.data || []).map(
          (n) => ({
            id: n.id,
            projectId: n.project_id,
            taskId: n.task_id,
            kind: n.kind,
            content: n.content || '',
            posX: Number(n.pos_x) || 0,
            posY: Number(n.pos_y) || 0,
            createdBy: n.created_by || '',
            createdAt: n.created_at,
          })
        )
      );

      setWorkflowEdges(
        (workflowEdgesResult.data || []).map(
          (e) => ({
            id: e.id,
            projectId: e.project_id,
            sourceId: e.source_id,
            targetId: e.target_id,
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

  async function touchPresence() {
    if (!session) return;

    try {
      await supabase
        .from('users')
        .update({
          last_seen: new Date().toISOString(),
        })
        .eq('username', session.username);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!dataLoaded || !session)
      return;

    touchPresence();

    const interval = setInterval(() => {
      if (
        document.visibilityState ===
        'visible'
      ) {
        loadData();
        touchPresence();
      }
    }, 10000);

    return () =>
      clearInterval(interval);
  }, [dataLoaded, session]);

  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          setMessages((prev) => {
            if (
              prev.some(
                (m) => m.id === payload.new.id
              )
            ) {
              return prev;
            }

            return [
              ...prev,
              mapMessageRow(payload.new),
            ].sort((a, b) =>
              a.createdAt.localeCompare(
                b.createdAt
              )
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

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
              assignees:
                data.assignees || [],
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
              assignees:
                data.assignees || [],
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
            assignees:
              data.assignees &&
              data.assignees.length
                ? data.assignees
                : [session.displayName],
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

  async function updateTask(taskId, data) {
    try {
      const { error } =
        await supabase
          .from('tasks')
          .update({
            title: data.title,
            due_date: data.dueDate || null,
            status: data.status,
            assignees: data.assignees || [],
          })
          .eq('id', taskId);

      if (error) throw error;

      await loadData();

      setEditingTask(null);

      showToast('Tâche mise à jour.');
    } catch (error) {
      console.error(error);

      showToast(
        "Impossible de modifier la tâche."
      );
    }
  }

  async function addTaskComment(taskId, text) {
    try {
      const { error } =
        await supabase
          .from('task_comments')
          .insert({
            id: genId(),
            task_id: taskId,
            author: session.displayName,
            text,
          });

      if (error) throw error;

      await loadData();
    } catch (error) {
      console.error(error);

      showToast(
        "Impossible d'ajouter le commentaire."
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
     CANVAS DE WORKFLOW
  ===================================================== */

  function nextWorkflowNodePosition(projectId) {
    const count = workflowNodes.filter(
      (n) => n.projectId === projectId
    ).length;

    const col = count % 4;
    const row = Math.floor(count / 4);

    return {
      x: 40 + col * 230,
      y: 40 + row * 130,
    };
  }

  async function toggleTaskOnCanvas(
    projectId,
    task
  ) {
    const existing = workflowNodes.find(
      (n) =>
        n.projectId === projectId &&
        n.taskId === task.id
    );

    if (existing) {
      await removeWorkflowNode(existing.id);
      return;
    }

    try {
      const pos = nextWorkflowNodePosition(
        projectId
      );

      const { error } =
        await supabase
          .from('workflow_nodes')
          .insert({
            id: genId(),
            project_id: projectId,
            task_id: task.id,
            kind: 'task',
            pos_x: pos.x,
            pos_y: pos.y,
            created_by: session.displayName,
          });

      if (error) throw error;

      await loadData();
    } catch (error) {
      console.error(error);

      showToast(
        "Impossible d'ajouter la tâche au canvas."
      );
    }
  }

  async function addWorkflowNote(projectId) {
    try {
      const pos = nextWorkflowNodePosition(
        projectId
      );

      const { error } =
        await supabase
          .from('workflow_nodes')
          .insert({
            id: genId(),
            project_id: projectId,
            kind: 'note',
            content: '',
            pos_x: pos.x,
            pos_y: pos.y,
            created_by: session.displayName,
          });

      if (error) throw error;

      await loadData();
    } catch (error) {
      console.error(error);

      showToast(
        "Impossible d'ajouter une note."
      );
    }
  }

  async function updateWorkflowNoteContent(
    nodeId,
    content
  ) {
    setWorkflowNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? { ...n, content }
          : n
      )
    );

    try {
      const { error } =
        await supabase
          .from('workflow_nodes')
          .update({ content })
          .eq('id', nodeId);

      if (error) throw error;
    } catch (error) {
      console.error(error);

      showToast(
        "Impossible d'enregistrer la note."
      );
    }
  }

  async function moveWorkflowNode(
    nodeId,
    posX,
    posY
  ) {
    setWorkflowNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? { ...n, posX, posY }
          : n
      )
    );

    try {
      const { error } =
        await supabase
          .from('workflow_nodes')
          .update({
            pos_x: posX,
            pos_y: posY,
          })
          .eq('id', nodeId);

      if (error) throw error;
    } catch (error) {
      console.error(error);

      showToast(
        "Impossible d'enregistrer la position."
      );
    }
  }

  async function removeWorkflowNode(nodeId) {
    const previousNodes = workflowNodes;
    const previousEdges = workflowEdges;

    setWorkflowNodes((prev) =>
      prev.filter((n) => n.id !== nodeId)
    );

    setWorkflowEdges((prev) =>
      prev.filter(
        (e) =>
          e.sourceId !== nodeId &&
          e.targetId !== nodeId
      )
    );

    try {
      const { error } =
        await supabase
          .from('workflow_nodes')
          .delete()
          .eq('id', nodeId);

      if (error) throw error;
    } catch (error) {
      console.error(error);

      setWorkflowNodes(previousNodes);
      setWorkflowEdges(previousEdges);

      showToast(
        'Impossible de retirer cet élément du canvas.'
      );
    }
  }

  async function addWorkflowEdge(
    sourceId,
    targetId
  ) {
    const tempEdge = {
      id: genId(),
      projectId: selectedProjectId,
      sourceId,
      targetId,
    };

    setWorkflowEdges((prev) => [
      ...prev,
      tempEdge,
    ]);

    try {
      const { error } =
        await supabase
          .from('workflow_edges')
          .insert({
            id: tempEdge.id,
            project_id: selectedProjectId,
            source_id: sourceId,
            target_id: targetId,
          });

      if (error) throw error;
    } catch (error) {
      console.error(error);

      setWorkflowEdges((prev) =>
        prev.filter(
          (e) => e.id !== tempEdge.id
        )
      );

      showToast(
        "Impossible de créer la flèche."
      );
    }
  }

  async function deleteWorkflowEdge(edgeId) {
    const previousEdges = workflowEdges;

    setWorkflowEdges((prev) =>
      prev.filter((e) => e.id !== edgeId)
    );

    try {
      const { error } =
        await supabase
          .from('workflow_edges')
          .delete()
          .eq('id', edgeId);

      if (error) throw error;
    } catch (error) {
      console.error(error);

      setWorkflowEdges(previousEdges);

      showToast(
        'Impossible de supprimer la flèche.'
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
     CHAT
  ===================================================== */

  async function sendMessage(channel, text) {
    if (!text.trim()) return;

    const id = genId();

    try {
      const { error } =
        await supabase
          .from('messages')
          .insert({
            id,
            channel,
            sender_username:
              session.username,
            sender_display_name:
              session.displayName,
            text: text.trim(),
          });

      if (error) throw error;

      setMessages((prev) => {
        if (prev.some((m) => m.id === id)) {
          return prev;
        }

        return [
          ...prev,
          {
            id,
            channel,
            senderUsername:
              session.username,
            senderDisplayName:
              session.displayName,
            text: text.trim(),
            createdAt:
              new Date().toISOString(),
          },
        ];
      });
    } catch (error) {
      console.error(error);

      showToast(
        "Impossible d'envoyer le message."
      );
    }
  }

  /* =====================================================
     DOCUMENTS
  ===================================================== */

  async function createFolder(name) {
    try {
      const { error } =
        await supabase
          .from('doc_folders')
          .insert({
            id: genId(),
            name,
            created_by: session.displayName,
          });

      if (error) throw error;

      await loadData();

      setShowFolderForm(false);

      showToast('Dossier créé.');
    } catch (error) {
      console.error(error);

      showToast(
        'Impossible de créer le dossier.'
      );
    }
  }

  async function deleteFolder(id) {
    try {
      const { error } =
        await supabase
          .from('doc_folders')
          .delete()
          .eq('id', id);

      if (error) throw error;

      if (docFolderFilter === id) {
        setDocFolderFilter('all');
      }

      await loadData();
    } catch (error) {
      console.error(error);

      showToast(
        'Impossible de supprimer le dossier.'
      );
    }
  }

  async function uploadDocumentFile({
    file,
    name,
    folderId,
    projectId,
    taskId,
  }) {
    const ext = file.name.includes('.')
      ? file.name
          .split('.')
          .pop()
          .replace(/[^a-zA-Z0-9]/g, '')
      : '';

    const path = `${genId()}${
      ext ? '.' + ext : ''
    }`;

    const { error: uploadError } =
      await supabase.storage
        .from('documents')
        .upload(path, file);

    if (uploadError) throw uploadError;

    const docId = genId();

    const { error } =
      await supabase
        .from('documents')
        .insert({
          id: docId,
          name,
          storage_path: path,
          mime_type: file.type || '',
          size: file.size,
          folder_id: folderId,
          project_id: projectId,
          task_id: taskId,
          uploaded_by: session.displayName,
        });

    if (error) throw error;

    return docId;
  }

  async function uploadDocument({
    file,
    name,
    folderId,
    projectId,
    taskId,
  }) {
    try {
      await uploadDocumentFile({
        file,
        name,
        folderId,
        projectId,
        taskId,
      });

      await loadData();

      setShowDocumentUpload(null);

      showToast('Document ajouté.');
    } catch (error) {
      console.error(error);

      showToast(
        "Impossible d'ajouter le document."
      );
    }
  }

  async function reclassifyDocument(id, data) {
    try {
      const { error } =
        await supabase
          .from('documents')
          .update({
            folder_id: data.folderId,
            project_id: data.projectId,
            task_id: data.taskId,
          })
          .eq('id', id);

      if (error) throw error;

      await loadData();

      setReclassifyDoc(null);

      showToast('Document rangé.');
    } catch (error) {
      console.error(error);

      showToast(
        'Impossible de ranger le document.'
      );
    }
  }

  async function deleteDocument(doc) {
    try {
      await supabase.storage
        .from('documents')
        .remove([doc.storagePath]);

      const { error } =
        await supabase
          .from('documents')
          .delete()
          .eq('id', doc.id);

      if (error) throw error;

      await loadData();

      showToast('Document supprimé.');
    } catch (error) {
      console.error(error);

      showToast(
        'Impossible de supprimer le document.'
      );
    }
  }

  function getDocumentUrl(doc) {
    return supabase.storage
      .from('documents')
      .getPublicUrl(doc.storagePath).data
      .publicUrl;
  }

  /* =====================================================
     EVALUATIONS
  ===================================================== */

  async function createPlayer(data) {
    try {
      const id = genId();

      const { error } =
        await supabase
          .from('players')
          .insert({
            id,
            first_name: data.firstName,
            last_name: data.lastName,
            age: data.age,
            category: data.category,
            created_by: session.displayName,
          });

      if (error) throw error;

      await loadData();

      setShowPlayerForm(false);
      setSelectedPlayerId(id);

      showToast('Joueur créé.');
    } catch (error) {
      console.error(error);

      showToast(
        'Impossible de créer le joueur.'
      );
    }
  }

  async function deletePlayer(id) {
    try {
      const { error } =
        await supabase
          .from('players')
          .delete()
          .eq('id', id);

      if (error) throw error;

      setSelectedPlayerId(null);

      await loadData();
    } catch (error) {
      console.error(error);

      showToast(
        'Impossible de supprimer le joueur.'
      );
    }
  }

  async function createEvaluation(playerId, scores) {
    try {
      const { error } =
        await supabase
          .from('evaluations')
          .insert({
            id: genId(),
            player_id: playerId,
            scores,
            evaluated_by: session.displayName,
          });

      if (error) throw error;

      await loadData();

      setShowEvaluationForm(false);
      setViewingEvaluationId(null);

      showToast('Évaluation enregistrée.');
    } catch (error) {
      console.error(error);

      showToast(
        "Impossible d'enregistrer l'évaluation."
      );
    }
  }

  async function deleteEvaluation(id) {
    try {
      const { error } =
        await supabase
          .from('evaluations')
          .delete()
          .eq('id', id);

      if (error) throw error;

      setViewingEvaluationId(null);

      await loadData();
    } catch (error) {
      console.error(error);

      showToast(
        "Impossible de supprimer l'évaluation."
      );
    }
  }

  /* =====================================================
     FINANCE
  ===================================================== */

  async function createTransaction(data) {
    try {
      let documentId = null;

      if (data.file) {
        documentId = await uploadDocumentFile({
          file: data.file,
          name: data.file.name,
          folderId: null,
          projectId: data.projectId,
          taskId: data.taskId,
        });
      }

      const { error } =
        await supabase
          .from('transactions')
          .insert({
            id: genId(),
            project_id: data.projectId,
            task_id: data.taskId,
            type: data.type,
            amount: data.amount,
            reason: data.reason,
            document_id: documentId,
            created_by: session.displayName,
          });

      if (error) throw error;

      await loadData();

      setShowTransactionForm(null);

      showToast('Mouvement enregistré.');
    } catch (error) {
      console.error(error);

      showToast(
        "Impossible d'enregistrer le mouvement."
      );
    }
  }

  async function updateTransaction(id, data) {
    try {
      let documentId = data.removeDocument
        ? null
        : undefined;

      if (data.file) {
        documentId = await uploadDocumentFile({
          file: data.file,
          name: data.file.name,
          folderId: null,
          projectId: data.projectId,
          taskId: data.taskId,
        });
      }

      const updates = {
        project_id: data.projectId,
        task_id: data.taskId,
        type: data.type,
        amount: data.amount,
        reason: data.reason,
      };

      if (documentId !== undefined) {
        updates.document_id = documentId;
      }

      const { error } =
        await supabase
          .from('transactions')
          .update(updates)
          .eq('id', id);

      if (error) throw error;

      await loadData();

      setShowTransactionForm(null);

      showToast('Mouvement mis à jour.');
    } catch (error) {
      console.error(error);

      showToast(
        'Impossible de modifier le mouvement.'
      );
    }
  }

  async function deleteTransaction(id) {
    try {
      const { error } =
        await supabase
          .from('transactions')
          .delete()
          .eq('id', id);

      if (error) throw error;

      await loadData();

      showToast('Mouvement supprimé.');
    } catch (error) {
      console.error(error);

      showToast(
        'Impossible de supprimer le mouvement.'
      );
    }
  }

  /* =====================================================
     NAVIGATION
  ===================================================== */

  function goToTab(id) {
    setActiveTab(id);
    setSelectedProjectId(null);
    setSelectedDay(null);
    setSelectedPlayerId(null);
    setViewingEvaluationId(null);
    setOpenNavMenu(null);
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

  const tasksById = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [tasks]);

  const projectWorkflowNodes = useMemo(
    () =>
      selectedProject
        ? workflowNodes.filter(
            (n) =>
              n.projectId === selectedProject.id
          )
        : [],
    [workflowNodes, selectedProject]
  );

  const projectWorkflowEdges = useMemo(
    () =>
      selectedProject
        ? workflowEdges.filter(
            (e) =>
              e.projectId === selectedProject.id
          )
        : [],
    [workflowEdges, selectedProject]
  );

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

  const visibleTasksByDate =
    useMemo(() => {
      if (!filterMember) return tasksByDate;

      const result = {};

      Object.keys(tasksByDate).forEach((date) => {
        const filtered = tasksByDate[date].filter(
          (task) =>
            task.assignees &&
            task.assignees.includes(filterMember)
        );

        if (filtered.length) {
          result[date] = filtered;
        }
      });

      return result;
    }, [tasksByDate, filterMember]);

  const visibleEventsByDate =
    useMemo(() => {
      if (!filterMember) return eventsByDate;

      const result = {};

      Object.keys(eventsByDate).forEach((date) => {
        const filtered = eventsByDate[date].filter(
          (event) => event.assignee === filterMember
        );

        if (filtered.length) {
          result[date] = filtered;
        }
      });

      return result;
    }, [eventsByDate, filterMember]);

  const activeChatChannel =
    chatRoom === 'global'
      ? 'global'
      : getDmChannel(
          session?.username,
          chatRoom
        );

  const roomMessages = useMemo(
    () =>
      messages.filter(
        (m) => m.channel === activeChatChannel
      ),
    [messages, activeChatChannel]
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [roomMessages.length, chatRoom]);

  const visibleDocuments = useMemo(() => {
    let list = documents;

    if (docFolderFilter === 'none') {
      list = list.filter((d) => !d.folderId);
    } else if (docFolderFilter !== 'all') {
      list = list.filter(
        (d) => d.folderId === docFolderFilter
      );
    }

    if (docSearch.trim()) {
      const q = docSearch.trim().toLowerCase();
      list = list.filter((d) =>
        d.name.toLowerCase().includes(q)
      );
    }

    const sorted = [...list];

    if (docSort === 'name_asc') {
      sorted.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    } else if (docSort === 'name_desc') {
      sorted.sort((a, b) =>
        b.name.localeCompare(a.name)
      );
    } else if (docSort === 'oldest') {
      sorted.sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt)
      );
    } else {
      sorted.sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      );
    }

    return sorted;
  }, [
    documents,
    docFolderFilter,
    docSearch,
    docSort,
  ]);

  const selectedPlayer = selectedPlayerId
    ? players.find(
        (p) => p.id === selectedPlayerId
      )
    : null;

  const playerEvaluations = useMemo(
    () =>
      evaluations
        .filter(
          (e) => e.playerId === selectedPlayerId
        )
        .sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt)
        ),
    [evaluations, selectedPlayerId]
  );

  const viewingEvaluation = viewingEvaluationId
    ? playerEvaluations.find(
        (e) => e.id === viewingEvaluationId
      ) || playerEvaluations[0]
    : playerEvaluations[0];

  const visibleTransactions = useMemo(
    () =>
      financeProjectFilter === 'all'
        ? transactions
        : transactions.filter(
            (t) =>
              t.projectId === financeProjectFilter
          ),
    [transactions, financeProjectFilter]
  );

  const financeTotals = (list) => {
    const totalIn = list
      .filter((t) => t.type === 'in')
      .reduce((a, t) => a + t.amount, 0);

    const totalOut = list
      .filter((t) => t.type === 'out')
      .reduce((a, t) => a + t.amount, 0);

    return {
      totalIn,
      totalOut,
      balance: totalIn - totalOut,
    };
  };

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

        :root {
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
        }

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

        .melee-app .nav-dropdown {
          position:relative;
        }

        .nav-dropdown-menu {
          box-sizing:border-box;
          font-family:'Work Sans',sans-serif;
          position:fixed;
          background:var(--white);
          border:1px solid var(--line);
          border-radius:10px;
          box-shadow:0 10px 24px rgba(22,20,10,.12);
          padding:6px;
          min-width:180px;
          z-index:60;
          display:flex;
          flex-direction:column;
          gap:2px;
        }

        .nav-dropdown-item {
          box-sizing:border-box;
          font-family:'Work Sans',sans-serif;
          display:flex;
          align-items:center;
          gap:8px;
          white-space:nowrap;
          padding:9px 10px;
          font-size:13px;
          font-weight:600;
          color:var(--ink);
          cursor:pointer;
          background:none;
          border:none;
          border-radius:7px;
          text-align:left;
        }

        .nav-dropdown-item:hover,
        .nav-dropdown-item.active {
          background:var(--pitch-tint);
          color:var(--pitch-dark);
        }

        .melee-app .chat-drawer-toggle {
          position:fixed;
          top:50%;
          transform:translateY(-50%);
          z-index:70;
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:2px;
          background:var(--pitch-dark);
          color:var(--chalk);
          border:none;
          border-radius:8px 0 0 8px;
          padding:12px 6px;
          cursor:pointer;
        }

        .melee-app .chat-drawer {
          position:fixed;
          top:0;
          bottom:0;
          right:0;
          width:340px;
          max-width:88vw;
          background:var(--white);
          border-left:1px solid var(--line);
          box-shadow:-8px 0 24px rgba(22,20,10,.1);
          z-index:65;
          display:flex;
          flex-direction:column;
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

        .melee-app .workflow-canvas-block {
          margin-top:10px;
        }

        .melee-app .workflow-toolbar {
          display:flex;
          align-items:center;
          gap:6px;
          margin-bottom:8px;
        }

        .melee-app .workflow-zoom-label {
          font-size:12px;
          font-weight:600;
          color:var(--ink-light);
          min-width:38px;
          text-align:center;
        }

        .melee-app .workflow-toolbar-divider {
          width:1px;
          height:22px;
          background:var(--line);
          margin:0 4px;
        }

        .melee-app .workflow-canvas {
          position:relative;
          height:440px;
          border:1px solid var(--line);
          border-radius:12px;
          background:var(--chalk);
          background-image:radial-gradient(var(--line) 1px, transparent 1px);
          background-size:18px 18px;
          overflow:hidden;
          user-select:none;
        }

        .melee-app .workflow-inner {
          position:absolute;
          top:0;
          left:0;
          transform-origin:0 0;
        }

        .melee-app .workflow-edges-svg {
          position:absolute;
          top:0;
          left:0;
          pointer-events:none;
        }

        .melee-app .workflow-edges-svg .workflow-edge-hit {
          pointer-events:stroke;
        }

        .melee-app .workflow-node {
          position:absolute;
          width:200px;
          background:var(--white);
          border-radius:10px;
          border:1px solid var(--line);
          box-shadow:0 2px 8px rgba(22,20,10,.08);
          padding:10px 12px;
          cursor:grab;
          z-index:2;
        }

        .melee-app .workflow-node.is-dragging {
          cursor:grabbing;
          box-shadow:0 8px 20px rgba(22,20,10,.18);
          z-index:5;
        }

        .melee-app .workflow-node-task {
          border-left:4px solid var(--line);
        }

        .melee-app .workflow-node-note {
          background:var(--amber-tint);
          border-color:var(--amber);
        }

        .melee-app .workflow-node-remove {
          position:absolute;
          top:-8px;
          right:-8px;
          width:18px;
          height:18px;
          border-radius:50%;
          border:1px solid var(--line);
          background:var(--white);
          color:var(--ink-light);
          display:flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          z-index:3;
        }

        .melee-app .workflow-node-title {
          font-size:13px;
          font-weight:600;
          color:var(--ink);
          margin-bottom:4px;
        }

        .melee-app .workflow-node-meta {
          display:flex;
          align-items:center;
          gap:6px;
          flex-wrap:wrap;
        }

        .melee-app .workflow-node-due {
          font-size:11px;
          color:var(--ink-light);
        }

        .melee-app .workflow-node-assignees {
          display:flex;
          flex-direction:column;
          gap:2px;
          margin-top:6px;
        }

        .melee-app .workflow-node-assignee {
          display:flex;
          align-items:center;
          gap:5px;
          font-size:11px;
          color:var(--ink-light);
        }

        .melee-app .workflow-node-handle {
          position:absolute;
          top:50%;
          right:-7px;
          transform:translateY(-50%);
          width:14px;
          height:14px;
          border-radius:50%;
          background:var(--pitch-dark);
          border:2px solid var(--white);
          cursor:crosshair;
          z-index:3;
        }

        .melee-app .workflow-note-text {
          font-size:12px;
          color:var(--tan-text);
          white-space:pre-wrap;
          min-height:20px;
          cursor:text;
        }

        .melee-app .workflow-note-textarea {
          width:100%;
          min-height:60px;
          border:none;
          background:transparent;
          font-family:'Work Sans',sans-serif;
          font-size:12px;
          color:var(--tan-text);
          resize:vertical;
          padding:0;
        }

        .melee-app .workflow-note-textarea:focus {
          outline:none;
        }

        .melee-app .workflow-edge-delete {
          pointer-events:auto;
          width:24px;
          height:24px;
          border-radius:50%;
          border:1px solid var(--red);
          background:var(--white);
          color:var(--red);
          display:flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
        }

        .melee-app .workflow-empty-hint {
          position:absolute;
          inset:0;
          display:flex;
          align-items:center;
          justify-content:center;
          text-align:center;
          padding:0 40px;
          font-size:13px;
          color:var(--ink-light);
          pointer-events:none;
        }

        .melee-app .icon-btn.active {
          background:var(--pitch-tint);
          color:var(--pitch-dark);
          border-color:var(--pitch);
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
          {NAV_ITEMS.map((item) => {
            if (!item.children) {
              return (
                <button
                  key={item.id}
                  className={`nav-tab ${
                    activeTab === item.id
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    goToTab(item.id)
                  }
                >
                  <item.icon size={15} />
                  {item.label}

                  {item.stub && (
                    <span className="stub-dot" />
                  )}
                </button>
              );
            }

            const isActiveGroup =
              item.children.some(
                (child) =>
                  child.id === activeTab
              );

            return (
              <div
                key={item.id}
                className="nav-dropdown"
                onMouseEnter={(e) =>
                  openNavDropdown(
                    item,
                    e.currentTarget
                  )
                }
                onMouseLeave={scheduleNavClose}
              >
                <button
                  className={`nav-tab ${
                    isActiveGroup ? 'active' : ''
                  }`}
                  onClick={(e) =>
                    openNavDropdown(
                      item,
                      e.currentTarget
                        .parentElement
                    )
                  }
                >
                  <item.icon size={15} />
                  {item.label}
                </button>

                {openNavMenu === item.id &&
                  createPortal(
                    <div
                      className="nav-dropdown-menu"
                      style={{
                        top: navMenuPos.top,
                        left: navMenuPos.left,
                      }}
                      onMouseEnter={
                        cancelNavClose
                      }
                      onMouseLeave={
                        scheduleNavClose
                      }
                    >
                      {item.children.map(
                        (child) => (
                          <button
                            key={child.id}
                            className={`nav-dropdown-item ${
                              activeTab ===
                              child.id
                                ? 'active'
                                : ''
                            }`}
                            onClick={() => {
                              goToTab(child.id);
                              setOpenNavMenu(
                                null
                              );
                            }}
                          >
                            <child.icon
                              size={14}
                            />
                            {child.label}

                            {child.stub && (
                              <span className="stub-dot" />
                            )}
                          </button>
                        )
                      )}
                    </div>,
                    document.body
                  )}
              </div>
            );
          })}

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
                            getMemberColor={
                              getMemberColor
                            }
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

                  <h2 className="font-display text-lg mt-4">
                    Workflow
                  </h2>

                  <WorkflowCanvas
                    nodes={projectWorkflowNodes}
                    edges={projectWorkflowEdges}
                    tasksById={tasksById}
                    getMemberColor={
                      getMemberColor
                    }
                    onMoveNode={
                      moveWorkflowNode
                    }
                    onAddEdge={
                      addWorkflowEdge
                    }
                    onDeleteEdge={
                      deleteWorkflowEdge
                    }
                    onRemoveNode={
                      removeWorkflowNode
                    }
                    onUpdateNoteContent={
                      updateWorkflowNoteContent
                    }
                    onAddNote={() =>
                      addWorkflowNote(
                        selectedProject.id
                      )
                    }
                  />

                  {selectedProject.description && (
                    <p className="text-sm mt-3">
                      {
                        selectedProject.description
                      }
                    </p>
                  )}

                  {selectedProject.assignees &&
                    selectedProject.assignees.length >
                      0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedProject.assignees.map(
                          (name) => (
                            <span
                              key={name}
                              className="pill"
                              style={{
                                background:
                                  'var(--chalk)',
                                color: 'var(--ink)',
                              }}
                            >
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  background:
                                    getMemberColor(
                                      name
                                    ),
                                  display:
                                    'inline-block',
                                }}
                              />
                              {name}
                            </span>
                          )
                        )}
                      </div>
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
                        getMemberColor={
                          getMemberColor
                        }
                        onToggleStatus={
                          toggleTaskStatus
                        }
                        onDelete={
                          deleteTask
                        }
                        onEdit={
                          setEditingTask
                        }
                        onToggleCanvas={(t) =>
                          toggleTaskOnCanvas(
                            selectedProject.id,
                            t
                          )
                        }
                        isOnCanvas={projectWorkflowNodes.some(
                          (n) =>
                            n.taskId === task.id
                        )}
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

                  <div
                    className="flex items-center justify-between mt-6"
                  >
                    <h2 className="font-display text-lg">
                      Documents
                    </h2>

                    <button
                      className="btn-secondary"
                      onClick={() =>
                        setShowDocumentUpload({
                          projectId:
                            selectedProject.id,
                        })
                      }
                    >
                      <Upload size={13} />
                      Ajouter
                    </button>
                  </div>

                  {documents.filter(
                    (d) =>
                      d.projectId ===
                      selectedProject.id
                  ).length === 0 ? (
                    <p
                      className="text-sm mt-2"
                      style={{
                        color: 'var(--ink-light)',
                      }}
                    >
                      Aucun document lié à ce
                      projet.
                    </p>
                  ) : (
                    documents
                      .filter(
                        (d) =>
                          d.projectId ===
                          selectedProject.id
                      )
                      .map((doc) => (
                        <DocumentRow
                          key={doc.id}
                          doc={doc}
                          folders={docFolders}
                          projects={projects}
                          getDocumentUrl={
                            getDocumentUrl
                          }
                          onReclassify={
                            setReclassifyDoc
                          }
                          onDelete={(d) =>
                            setConfirmState({
                              message: `Supprimer "${d.name}" ?`,
                              onConfirm:
                                async () => {
                                  await deleteDocument(
                                    d
                                  );

                                  setConfirmState(
                                    null
                                  );
                                },
                            })
                          }
                          compact
                        />
                      ))
                  )}

                  <div className="flex items-center justify-between mt-6">
                    <h2 className="font-display text-lg">
                      Finances
                    </h2>

                    <button
                      className="btn-secondary"
                      onClick={() =>
                        setShowTransactionForm({
                          projectId:
                            selectedProject.id,
                        })
                      }
                    >
                      <Plus size={13} />
                      Mouvement
                    </button>
                  </div>

                  {(() => {
                    const projectTransactions =
                      transactions.filter(
                        (t) =>
                          t.projectId ===
                          selectedProject.id
                      );

                    const totals = financeTotals(
                      projectTransactions
                    );

                    if (
                      projectTransactions.length ===
                      0
                    ) {
                      return (
                        <p
                          className="text-sm mt-2"
                          style={{
                            color:
                              'var(--ink-light)',
                          }}
                        >
                          Aucun mouvement pour ce
                          projet.
                        </p>
                      );
                    }

                    return (
                      <>
                        <div
                          className="flex items-center gap-4 mt-2"
                          style={{
                            alignItems: 'center',
                          }}
                        >
                          <DonutChart
                            totalIn={
                              totals.totalIn
                            }
                            totalOut={
                              totals.totalOut
                            }
                            size={110}
                          />

                          <div
                            style={{
                              display: 'flex',
                              flexDirection:
                                'column',
                              gap: 4,
                            }}
                          >
                            <span
                              className="text-xs"
                              style={{
                                color: '#2D6A4F',
                              }}
                            >
                              Rentrées :{' '}
                              {formatCurrency(
                                totals.totalIn
                              )}
                            </span>

                            <span
                              className="text-xs"
                              style={{
                                color:
                                  'var(--red)',
                              }}
                            >
                              Dépenses :{' '}
                              {formatCurrency(
                                totals.totalOut
                              )}
                            </span>
                          </div>
                        </div>

                        {projectTransactions
                          .slice(0, 4)
                          .map((transaction) => (
                            <TransactionRow
                              key={transaction.id}
                              transaction={
                                transaction
                              }
                              projects={projects}
                              tasks={tasks}
                              documents={
                                documents
                              }
                              getDocumentUrl={
                                getDocumentUrl
                              }
                              onEdit={(t) =>
                                setShowTransactionForm(
                                  { existing: t }
                                )
                              }
                              onDelete={(t) =>
                                setConfirmState({
                                  message:
                                    'Supprimer ce mouvement ?',
                                  onConfirm:
                                    async () => {
                                      await deleteTransaction(
                                        t.id
                                      );

                                      setConfirmState(
                                        null
                                      );
                                    },
                                })
                              }
                            />
                          ))}
                      </>
                    );
                  })()}
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

                <MemberLegend
                  users={users}
                  getMemberColor={getMemberColor}
                  filterMember={filterMember}
                  onSelect={setFilterMember}
                />

                {planningView ===
                'calendar' ? (
                  <>
                    <CalendarView
                      monthDate={
                        calendarMonth
                      }
                      tasksByDate={
                        visibleTasksByDate
                      }
                      eventsByDate={
                        visibleEventsByDate
                      }
                      getProjectColor={
                        getProjectColor
                      }
                      getMemberColor={
                        getMemberColor
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

                        {(visibleTasksByDate[
                          selectedDay
                        ] || []).map(
                          (task) => (
                            <TaskRow
                              key={task.id}
                              task={task}
                              getMemberColor={
                                getMemberColor
                              }
                              onToggleStatus={
                                toggleTaskStatus
                              }
                              onDelete={
                                deleteTask
                              }
                              onEdit={
                                setEditingTask
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

                        {(visibleEventsByDate[
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
                          (visibleEventsByDate[
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
                    tasksByDate={visibleTasksByDate}
                    eventsByDate={visibleEventsByDate}
                    getProjectColor={
                      getProjectColor
                    }
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
                          t.dueDate &&
                          (!filterMember ||
                            (t.assignees &&
                              t.assignees.includes(
                                filterMember
                              )))
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
                          getMemberColor={
                            getMemberColor
                          }
                          onToggleStatus={
                            toggleTaskStatus
                          }
                          onDelete={
                            deleteTask
                          }
                          onEdit={
                            setEditingTask
                          }
                        />
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* CHAT */}

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

            {/* DOCUMENTS */}

            {activeTab === 'docs' && (
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h1 className="font-display text-2xl">
                    Documents
                  </h1>

                  <button
                    className="btn-primary"
                    onClick={() =>
                      setShowDocumentUpload({})
                    }
                  >
                    <Upload size={14} />
                    Ajouter un document
                  </button>
                </div>

                <div className="pitch-divider" />

                <div className="flex gap-2 flex-wrap mb-3">
                  <div
                    style={{
                      position: 'relative',
                      flex: 1,
                      minWidth: 180,
                    }}
                  >
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
                      placeholder="Rechercher un document…"
                      value={docSearch}
                      onChange={(e) =>
                        setDocSearch(e.target.value)
                      }
                    />
                  </div>

                  <select
                    style={{ width: 'auto' }}
                    value={docSort}
                    onChange={(e) =>
                      setDocSort(e.target.value)
                    }
                  >
                    <option value="recent">
                      Plus récent
                    </option>
                    <option value="oldest">
                      Plus ancien
                    </option>
                    <option value="name_asc">
                      Nom A → Z
                    </option>
                    <option value="name_desc">
                      Nom Z → A
                    </option>
                  </select>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    className="pill"
                    style={{
                      background:
                        docFolderFilter === 'all'
                          ? 'var(--pitch-dark)'
                          : 'var(--chalk)',
                      color:
                        docFolderFilter === 'all'
                          ? 'var(--white)'
                          : 'var(--ink)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() =>
                      setDocFolderFilter('all')
                    }
                  >
                    Tous
                  </button>

                  <button
                    className="pill"
                    style={{
                      background:
                        docFolderFilter === 'none'
                          ? 'var(--pitch-dark)'
                          : 'var(--chalk)',
                      color:
                        docFolderFilter === 'none'
                          ? 'var(--white)'
                          : 'var(--ink)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() =>
                      setDocFolderFilter('none')
                    }
                  >
                    Non classé
                  </button>

                  {docFolders.map((folder) => (
                    <span
                      key={folder.id}
                      className="pill"
                      style={{
                        background:
                          docFolderFilter ===
                          folder.id
                            ? 'var(--pitch-dark)'
                            : 'var(--chalk)',
                        color:
                          docFolderFilter ===
                          folder.id
                            ? 'var(--white)'
                            : 'var(--ink)',
                        cursor: 'pointer',
                      }}
                      onClick={() =>
                        setDocFolderFilter(
                          folder.id
                        )
                      }
                    >
                      <Folder size={10} />
                      {folder.name}

                      <X
                        size={10}
                        onClick={(e) => {
                          e.stopPropagation();

                          setConfirmState({
                            message: `Supprimer le dossier "${folder.name}" ? Les documents qu'il contient repasseront en "Non classé".`,
                            onConfirm:
                              async () => {
                                await deleteFolder(
                                  folder.id
                                );

                                setConfirmState(
                                  null
                                );
                              },
                          });
                        }}
                      />
                    </span>
                  ))}

                  <button
                    className="pill"
                    style={{
                      background: 'var(--white)',
                      color: 'var(--ink-light)',
                      border: '1px dashed var(--line)',
                      cursor: 'pointer',
                    }}
                    onClick={() =>
                      setShowFolderForm(true)
                    }
                  >
                    <FolderPlus size={11} />
                    Nouveau dossier
                  </button>
                </div>

                {visibleDocuments.length === 0 ? (
                  <p
                    className="text-sm"
                    style={{
                      color: 'var(--ink-light)',
                    }}
                  >
                    Aucun document.
                  </p>
                ) : (
                  <div>
                    {visibleDocuments.map((doc) => (
                      <DocumentRow
                        key={doc.id}
                        doc={doc}
                        folders={docFolders}
                        projects={projects}
                        getDocumentUrl={
                          getDocumentUrl
                        }
                        onReclassify={
                          setReclassifyDoc
                        }
                        onDelete={(d) =>
                          setConfirmState({
                            message: `Supprimer "${d.name}" ?`,
                            onConfirm:
                              async () => {
                                await deleteDocument(
                                  d
                                );

                                setConfirmState(
                                  null
                                );
                              },
                          })
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* EVALUATIONS */}

            {activeTab === 'evaluations' &&
              !selectedPlayer && (
                <div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h1 className="font-display text-2xl">
                      Évaluations
                    </h1>

                    <button
                      className="btn-primary"
                      onClick={() =>
                        setShowPlayerForm(true)
                      }
                    >
                      <Plus size={14} />
                      Nouveau joueur
                    </button>
                  </div>

                  <div className="pitch-divider" />

                  {players.length === 0 ? (
                    <p
                      className="text-sm"
                      style={{
                        color: 'var(--ink-light)',
                      }}
                    >
                      Aucun joueur pour l'instant.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {players.map((player) => {
                        const playerEvals =
                          evaluations.filter(
                            (e) =>
                              e.playerId ===
                              player.id
                          );

                        const latest = [
                          ...playerEvals,
                        ].sort((a, b) =>
                          b.createdAt.localeCompare(
                            a.createdAt
                          )
                        )[0];

                        const overall = latest
                          ? getOverallAverage(
                              latest.scores
                            )
                          : null;

                        return (
                          <div
                            key={player.id}
                            className="card"
                            onClick={() =>
                              setSelectedPlayerId(
                                player.id
                              )
                            }
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-display text-lg">
                                {player.firstName}{' '}
                                {player.lastName}
                              </h3>

                              <span
                                className="pill"
                                style={{
                                  background:
                                    'var(--chalk)',
                                  color: 'var(--ink)',
                                }}
                              >
                                {player.category}
                              </span>
                            </div>

                            <p
                              className="text-xs mt-1"
                              style={{
                                color:
                                  'var(--ink-light)',
                              }}
                            >
                              {player.age
                                ? `${player.age} ans · `
                                : ''}
                              {playerEvals.length}{' '}
                              évaluation
                              {playerEvals.length > 1
                                ? 's'
                                : ''}
                            </p>

                            {overall !== null && (
                              <p
                                className="score mt-3"
                                style={{
                                  color:
                                    'var(--pitch-dark)',
                                }}
                              >
                                {overall.toFixed(1)}
                                <span
                                  style={{
                                    color:
                                      'var(--ink-light)',
                                    fontWeight: 400,
                                    fontSize: 14,
                                  }}
                                >
                                  {' '}
                                  / 5
                                </span>
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            {activeTab === 'evaluations' &&
              selectedPlayer && (
                <div>
                  <button
                    className="btn-secondary"
                    onClick={() =>
                      setSelectedPlayerId(null)
                    }
                  >
                    <ChevronLeft size={14} />
                    Joueurs
                  </button>

                  <div className="flex items-start justify-between mt-4 flex-wrap gap-2">
                    <div>
                      <h1 className="font-display text-2xl">
                        {selectedPlayer.firstName}{' '}
                        {selectedPlayer.lastName}
                      </h1>

                      <p
                        className="text-sm mt-1"
                        style={{
                          color: 'var(--ink-light)',
                        }}
                      >
                        {selectedPlayer.category}
                        {selectedPlayer.age
                          ? ` · ${selectedPlayer.age} ans`
                          : ''}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="btn-primary"
                        onClick={() =>
                          setShowEvaluationForm(
                            true
                          )
                        }
                      >
                        <Plus size={14} />
                        Nouvelle évaluation
                      </button>

                      <button
                        className="icon-btn"
                        onClick={() =>
                          setConfirmState({
                            message: `Supprimer ${selectedPlayer.firstName} ${selectedPlayer.lastName} et toutes ses évaluations ?`,
                            onConfirm:
                              async () => {
                                await deletePlayer(
                                  selectedPlayer.id
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

                  <div className="pitch-divider" />

                  {playerEvaluations.length === 0 ? (
                    <p
                      className="text-sm"
                      style={{
                        color: 'var(--ink-light)',
                      }}
                    >
                      Aucune évaluation pour
                      l'instant.
                    </p>
                  ) : (
                    <>
                      <div className="flex flex-col items-center">
                        <RadarChart
                          data={getThemeAverages(
                            viewingEvaluation.scores
                          )}
                        />

                        <p
                          className="score"
                          style={{
                            color:
                              'var(--pitch-dark)',
                          }}
                        >
                          {getOverallAverage(
                            viewingEvaluation.scores
                          ).toFixed(1)}
                          <span
                            style={{
                              color:
                                'var(--ink-light)',
                              fontWeight: 400,
                              fontSize: 14,
                            }}
                          >
                            {' '}
                            / 5
                          </span>
                        </p>

                        <p
                          className="text-xs"
                          style={{
                            color: 'var(--ink-light)',
                          }}
                        >
                          Évalué par{' '}
                          {
                            viewingEvaluation.evaluatedBy
                          }{' '}
                          le{' '}
                          {formatDateFR(
                            viewingEvaluation.createdAt.slice(
                              0,
                              10
                            )
                          )}
                        </p>
                      </div>

                      <h2 className="font-display text-lg mt-6">
                        Historique
                      </h2>

                      {playerEvaluations.map(
                        (ev) => (
                          <div
                            key={ev.id}
                            className="flex items-center justify-between py-2"
                            style={{
                              borderBottom:
                                '1px solid var(--line)',
                              cursor: 'pointer',
                              background:
                                viewingEvaluation.id ===
                                ev.id
                                  ? 'var(--pitch-tint)'
                                  : 'transparent',
                            }}
                            onClick={() =>
                              setViewingEvaluationId(
                                ev.id
                              )
                            }
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {formatDateFR(
                                  ev.createdAt.slice(
                                    0,
                                    10
                                  )
                                )}
                              </p>

                              <p
                                className="text-xs"
                                style={{
                                  color:
                                    'var(--ink-light)',
                                }}
                              >
                                Par {ev.evaluatedBy}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className="score"
                                style={{
                                  fontSize: 16,
                                  color:
                                    'var(--pitch-dark)',
                                }}
                              >
                                {getOverallAverage(
                                  ev.scores
                                ).toFixed(1)}
                              </span>

                              <button
                                className="icon-btn"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  setConfirmState({
                                    message:
                                      'Supprimer cette évaluation ?',
                                    onConfirm:
                                      async () => {
                                        await deleteEvaluation(
                                          ev.id
                                        );

                                        setConfirmState(
                                          null
                                        );
                                      },
                                  });
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </>
                  )}
                </div>
              )}

            {/* FINANCE */}

            {activeTab === 'finance' && (
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h1 className="font-display text-2xl">
                    Finance
                  </h1>

                  <button
                    className="btn-primary"
                    onClick={() =>
                      setShowTransactionForm({})
                    }
                  >
                    <Plus size={14} />
                    Mouvement
                  </button>
                </div>

                <div className="pitch-divider" />

                <div className="mb-4">
                  <label>Projet</label>
                  <select
                    style={{ width: 'auto' }}
                    value={financeProjectFilter}
                    onChange={(e) =>
                      setFinanceProjectFilter(
                        e.target.value
                      )
                    }
                  >
                    <option value="all">
                      Tous les projets
                    </option>

                    {projects.map((project) => (
                      <option
                        key={project.id}
                        value={project.id}
                      >
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  className="flex items-center gap-6 flex-wrap"
                  style={{ alignItems: 'center' }}
                >
                  <DonutChart
                    totalIn={
                      financeTotals(
                        visibleTransactions
                      ).totalIn
                    }
                    totalOut={
                      financeTotals(
                        visibleTransactions
                      ).totalOut
                    }
                  />

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp
                        size={16}
                        color="#2D6A4F"
                      />
                      <span className="text-sm">
                        Rentrées :{' '}
                        <strong>
                          {formatCurrency(
                            financeTotals(
                              visibleTransactions
                            ).totalIn
                          )}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <TrendingDown
                        size={16}
                        color="var(--red)"
                      />
                      <span className="text-sm">
                        Dépenses :{' '}
                        <strong>
                          {formatCurrency(
                            financeTotals(
                              visibleTransactions
                            ).totalOut
                          )}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pitch-divider" />

                <h2 className="font-display text-lg">
                  Mouvements
                </h2>

                {visibleTransactions.length === 0 ? (
                  <p
                    className="text-sm"
                    style={{
                      color: 'var(--ink-light)',
                    }}
                  >
                    Aucun mouvement pour l'instant.
                  </p>
                ) : (
                  visibleTransactions.map(
                    (transaction) => (
                      <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                        projects={projects}
                        tasks={tasks}
                        documents={documents}
                        getDocumentUrl={
                          getDocumentUrl
                        }
                        onEdit={(t) =>
                          setShowTransactionForm({
                            existing: t,
                          })
                        }
                        onDelete={(t) =>
                          setConfirmState({
                            message:
                              'Supprimer ce mouvement ?',
                            onConfirm:
                              async () => {
                                await deleteTransaction(
                                  t.id
                                );

                                setConfirmState(
                                  null
                                );
                              },
                          })
                        }
                      />
                    )
                  )
                )}
              </div>
            )}

            {/* PAGES EN CONSTRUCTION */}

            {[
              'cycles',
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

      {/* CHAT (tiroir latéral) */}

      {session && (
        <>
          <button
            className="chat-drawer-toggle"
            style={{
              right: chatDrawerOpen ? 340 : 0,
            }}
            onClick={() =>
              setChatDrawerOpen((v) => !v)
            }
          >
            {chatDrawerOpen ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronLeft size={14} />
            )}
            <MessageSquare size={13} />
          </button>

          {chatDrawerOpen && (
            <div className="chat-drawer">
              <div
                className="flex items-center justify-between"
                style={{
                  padding: '12px 14px',
                  borderBottom:
                    '1px solid var(--line)',
                }}
              >
                <span
                  className="font-display"
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: '.06em',
                    fontSize: 14,
                  }}
                >
                  Chat
                </span>

                <button
                  className="icon-btn"
                  onClick={() =>
                    setChatDrawerOpen(false)
                  }
                >
                  <X size={14} />
                </button>
              </div>

              <div
                className="flex gap-1"
                style={{
                  padding: '8px 10px',
                  borderBottom:
                    '1px solid var(--line)',
                  overflowX: 'auto',
                }}
              >
                <button
                  className="nav-tab"
                  style={{
                    justifyContent: 'flex-start',
                    borderBottom: 'none',
                    borderRadius: 8,
                    background:
                      chatRoom === 'global'
                        ? 'var(--pitch-tint)'
                        : 'transparent',
                    color:
                      chatRoom === 'global'
                        ? 'var(--pitch-dark)'
                        : 'var(--ink-light)',
                  }}
                  onClick={() =>
                    setChatRoom('global')
                  }
                >
                  <MessageSquare size={14} />
                  Général
                </button>

                {users
                  .filter(
                    (u) =>
                      u.username !==
                      session.username
                  )
                  .map((user) => (
                    <button
                      key={user.username}
                      className="nav-tab"
                      style={{
                        justifyContent:
                          'flex-start',
                        borderBottom: 'none',
                        borderRadius: 8,
                        background:
                          chatRoom ===
                          user.username
                            ? 'var(--pitch-tint)'
                            : 'transparent',
                        color:
                          chatRoom ===
                          user.username
                            ? 'var(--pitch-dark)'
                            : 'var(--ink-light)',
                      }}
                      onClick={() =>
                        setChatRoom(
                          user.username
                        )
                      }
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: isOnline(
                            user
                          )
                            ? 'var(--pitch)'
                            : 'var(--line)',
                          display:
                            'inline-block',
                        }}
                      />
                      {user.displayName}
                    </button>
                  ))}
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {roomMessages.length === 0 ? (
                  <p
                    className="text-sm"
                    style={{
                      color: 'var(--ink-light)',
                    }}
                  >
                    Aucun message pour l'instant.
                  </p>
                ) : (
                  roomMessages.map((m) => {
                    const mine =
                      m.senderUsername ===
                      session.username;

                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: mine
                            ? 'flex-end'
                            : 'flex-start',
                          maxWidth: '85%',
                        }}
                      >
                        {chatRoom === 'global' &&
                          !mine && (
                            <p
                              className="text-xs"
                              style={{
                                color:
                                  getMemberColor(
                                    m.senderDisplayName
                                  ),
                              }}
                            >
                              {
                                m.senderDisplayName
                              }
                            </p>
                          )}

                        <div
                          style={{
                            background: mine
                              ? 'var(--pitch-dark)'
                              : 'var(--chalk)',
                            color: mine
                              ? 'var(--white)'
                              : 'var(--ink)',
                            borderRadius: 10,
                            padding: '8px 12px',
                          }}
                        >
                          <p className="text-sm">
                            {m.text}
                          </p>
                        </div>

                        <p
                          className="text-xs mt-1"
                          style={{
                            color:
                              'var(--ink-light)',
                            textAlign: mine
                              ? 'right'
                              : 'left',
                          }}
                        >
                          {formatTime(
                            new Date(m.createdAt)
                          )}
                        </p>
                      </div>
                    );
                  })
                )}

                <div ref={chatEndRef} />
              </div>

              <div
                className="flex gap-2"
                style={{
                  padding: 10,
                  borderTop:
                    '1px solid var(--line)',
                }}
              >
                <input
                  style={{ flex: 1 }}
                  placeholder="Écrire un message…"
                  value={chatDraft}
                  onChange={(e) =>
                    setChatDraft(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage(
                        activeChatChannel,
                        chatDraft
                      );
                      setChatDraft('');
                    }
                  }}
                />

                <button
                  className="btn-primary"
                  onClick={() => {
                    sendMessage(
                      activeChatChannel,
                      chatDraft
                    );
                    setChatDraft('');
                  }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL PROJET */}

      {showProjectForm && (
        <ProjectFormModal
          initial={editingProject}
          users={users}
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

      {/* MODIFIER TACHE */}

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          users={users}
          comments={taskComments.filter(
            (c) => c.taskId === editingTask.id
          )}
          taskDocuments={documents.filter(
            (d) => d.taskId === editingTask.id
          )}
          linkableDocuments={documents.filter(
            (d) =>
              d.projectId === editingTask.projectId &&
              d.taskId !== editingTask.id
          )}
          getDocumentUrl={getDocumentUrl}
          onSave={updateTask}
          onAddComment={addTaskComment}
          onLinkDocument={(docId) =>
            reclassifyDocument(docId, {
              folderId:
                documents.find(
                  (d) => d.id === docId
                )?.folderId || null,
              projectId: editingTask.projectId,
              taskId: editingTask.id,
            })
          }
          onUnlinkDocument={(docId) =>
            reclassifyDocument(docId, {
              folderId:
                documents.find(
                  (d) => d.id === docId
                )?.folderId || null,
              projectId: editingTask.projectId,
              taskId: null,
            })
          }
          onOpenDocumentUpload={() => {
            setShowDocumentUpload({
              projectId: editingTask.projectId,
              taskId: editingTask.id,
            });
            setEditingTask(null);
          }}
          taskCost={transactions.find(
            (t) => t.taskId === editingTask.id
          )}
          onOpenCostForm={(existingCost) => {
            setShowTransactionForm({
              existing: existingCost || null,
              projectId: editingTask.projectId,
              taskId: editingTask.id,
              type: 'out',
            });
            setEditingTask(null);
          }}
          onRemoveCost={(id) =>
            deleteTransaction(id)
          }
          onCancel={() => setEditingTask(null)}
        />
      )}

      {/* NOUVEAU DOSSIER */}

      {showFolderForm && (
        <FolderFormModal
          onSubmit={createFolder}
          onCancel={() => setShowFolderForm(false)}
        />
      )}

      {/* AJOUTER UN DOCUMENT */}

      {showDocumentUpload && (
        <DocumentUploadModal
          folders={docFolders}
          projects={projects}
          tasks={tasks}
          initialFolderId={
            docFolderFilter !== 'all' &&
            docFolderFilter !== 'none'
              ? docFolderFilter
              : null
          }
          initialProjectId={
            showDocumentUpload.projectId || null
          }
          initialTaskId={
            showDocumentUpload.taskId || null
          }
          onSubmit={uploadDocument}
          onCancel={() =>
            setShowDocumentUpload(null)
          }
        />
      )}

      {/* RANGER UN DOCUMENT */}

      {reclassifyDoc && (
        <DocumentReclassifyModal
          document={reclassifyDoc}
          folders={docFolders}
          projects={projects}
          tasks={tasks}
          onSubmit={reclassifyDocument}
          onCancel={() => setReclassifyDoc(null)}
        />
      )}

      {/* NOUVEAU JOUEUR */}

      {showPlayerForm && (
        <PlayerFormModal
          onSubmit={createPlayer}
          onCancel={() =>
            setShowPlayerForm(false)
          }
        />
      )}

      {/* NOUVELLE EVALUATION */}

      {showEvaluationForm && selectedPlayer && (
        <EvaluationFormModal
          player={selectedPlayer}
          onSubmit={(scores) =>
            createEvaluation(
              selectedPlayer.id,
              scores
            )
          }
          onCancel={() =>
            setShowEvaluationForm(false)
          }
        />
      )}

      {/* MOUVEMENT FINANCE */}

      {showTransactionForm && (
        <TransactionFormModal
          existing={
            showTransactionForm.existing || null
          }
          initialProjectId={
            showTransactionForm.projectId || null
          }
          initialTaskId={
            showTransactionForm.taskId || null
          }
          initialType={
            showTransactionForm.type || null
          }
          projects={projects}
          tasks={tasks}
          onSubmit={(data) =>
            showTransactionForm.existing
              ? updateTransaction(
                  showTransactionForm.existing.id,
                  data
                )
              : createTransaction(data)
          }
          onCancel={() =>
            setShowTransactionForm(null)
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