import React, { useState, useEffect, useMemo } from 'react';
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

const SUPABASE_URL = 'https://gfrfzhwpzocklqycdpxy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ahTXHPST4iPLQhlvRSfHMg_gvU5UjuK';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------------------------------------------------------------
   Constantes
--------------------------------------------------------------- */

const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DAYS_FULL_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const DAYS_FULL_MONDAY = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const PROJECT_COLORS = ['#2D6A4F', '#B08968', '#3D5A80', '#B23A30', '#8A6BAE', '#C98A2C'];
const SCHEDULE_COLORS = ['#2D6A4F', '#3D5A80', '#B08968', '#B23A30', '#8A6BAE', '#C98A2C', '#4C6B57', '#5C6259'];
const PASSWORD_CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

const STATUS_ORDER = ['a_venir', 'en_cours', 'termine'];
const STATUS_META = {
  a_venir: { label: 'À venir', bg: 'var(--tan-tint)', color: 'var(--tan-text)' },
  en_cours: { label: 'En cours', bg: 'var(--pitch-tint)', color: 'var(--pitch-dark)' },
  termine: { label: 'Terminé', bg: '#E7E9E6', color: '#55605A' },
};
const ROLE_META = {
  admin: { label: 'Admin', bg: 'var(--pitch-tint)', color: 'var(--pitch-dark)' },
  membre: { label: 'Membre', bg: '#E7E9E6', color: '#55605A' },
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
    description: "La gestion des cycles d'entraînement (préparation physique, périodisation, séances) arrivera dans une prochaine itération.",
  },
  chat: {
    icon: MessageSquare,
    title: "Chat d'équipe",
    description: "La messagerie entre membres de l'équipe s'ajoutera directement ici, dans une prochaine itération.",
  },
  docs: {
    icon: FileText,
    title: 'Documents',
    description: 'Le dépôt de documents et de liens partagés arrivera dans une prochaine itération.',
  },
};

/* ---------------------------------------------------------------
   Aides date / id / mots de passe
--------------------------------------------------------------- */

function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

function generatePassword(length = 10) {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += PASSWORD_CHARSET[Math.floor(Math.random() * PASSWORD_CHARSET.length)];
  }
  return out;
}

async function hashPassword(username, password) {
  const enc = new TextEncoder();
  const data = enc.encode(`${username.toLowerCase()}::${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
}

function formatDateFR(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS_FR[m - 1]}`;
}

function formatTime(date) {
  if (!date) return '';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1;
    const d = new Date(year, month, dayNum);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    cells.push({ day: d.getDate(), iso, currentMonth: d.getMonth() === month });
  }
  return cells;
}

/* ---------------------------------------------------------------
   Petits composants partagés
--------------------------------------------------------------- */

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.a_venir;
  return (
    <span className="pill" style={{ background: meta.bg, color: meta.color }}>
      {meta.label}
    </span>
  );
}

function RoleBadge({ role }) {
  const meta = ROLE_META[role] || ROLE_META.membre;
  return (
    <span className="pill" style={{ background: meta.bg, color: meta.color }}>
      {meta.label}
    </span>
  );
}

function TaskStatusIcon({ status }) {
  if (status === 'termine') return <Check size={14} />;
  if (status === 'en_cours') return <Loader2 size={14} />;
  return <Clock size={14} />;
}

function PasswordField({ value, onChange, placeholder, autoFocus, onKeyDown }) {
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
        onClick={() => setShow((s) => !s)}
        style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-light)', padding: 4 }}
        title={show ? 'Masquer' : 'Afficher'}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function TaskRow({ task, onToggleStatus, onDelete }) {
  const overdue = task.status !== 'termine' && task.dueDate && daysBetween(task.dueDate) < 0;
  const soon = task.status !== 'termine' && task.dueDate && daysBetween(task.dueDate) >= 0 && daysBetween(task.dueDate) <= 3;
  return (
    <div className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--line)' }}>
      <button
        className="icon-btn"
        title="Changer le statut"
        onClick={() => onToggleStatus(task)}
        style={{
          color: task.status === 'termine' ? 'var(--pitch)' : 'var(--ink-light)',
          borderColor: task.status === 'termine' ? 'var(--pitch)' : 'var(--line)',
        }}
      >
        <TaskStatusIcon status={task.status} />
      </button>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{
            textDecoration: task.status === 'termine' ? 'line-through' : 'none',
            color: task.status === 'termine' ? 'var(--ink-light)' : 'var(--ink)',
          }}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 flex-wrap mt-1">
          {task.assignee && (
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--ink-light)' }}>
              <User size={11} /> {task.assignee}
            </span>
          )}
          {task.dueDate && (
            <span className="text-xs" style={{ color: overdue ? 'var(--red)' : soon ? 'var(--amber)' : 'var(--ink-light)' }}>
              {formatDateFR(task.dueDate)}
            </span>
          )}
          {overdue && (
            <span className="pill" style={{ background: 'var(--red-tint)', color: 'var(--red)' }}>
              <AlertOctagon size={10} /> En retard
            </span>
          )}
          {soon && (
            <span className="pill" style={{ background: 'var(--amber-tint)', color: 'var(--amber)' }}>
              <AlertTriangle size={10} /> Bientôt
            </span>
          )}
        </div>
      </div>
      <button className="icon-btn" title="Supprimer la tâche" onClick={() => onDelete(task.id)}>
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function ProjectCard({ project, tasks, onClick }) {
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const done = projectTasks.filter((t) => t.status === 'termine').length;
  return (
    <div
      className="card"
      tabIndex={0}
      role="button"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      style={{ borderTop: `4px solid ${project.color}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-lg leading-tight">{project.name}</h3>
        <StatusPill status={project.status} />
      </div>
      {project.description && (
        <p
          className="text-sm mt-1"
          style={{ color: 'var(--ink-light)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {project.description}
        </p>
      )}
      <div className="flex items-end justify-between mt-4">
        <span className="text-xs" style={{ color: 'var(--ink-light)' }}>{formatRange(project.startDate, project.endDate)}</span>
        <span className="score" style={{ color: 'var(--pitch-dark)' }}>
          {done}
          <span style={{ color: 'var(--ink-light)', fontWeight: 400 }}> / {projectTasks.length}</span>
        </span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, danger }) {
  const isAlert = danger && value > 0;
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase" style={{ color: 'var(--ink-light)', letterSpacing: '0.03em' }}>{label}</span>
        <Icon size={16} style={{ color: isAlert ? 'var(--red)' : 'var(--pitch)' }} />
      </div>
      <p className="score mt-1" style={{ color: isAlert ? 'var(--red)' : 'var(--ink)', fontSize: '28px' }}>{value}</p>
    </div>
  );
}

function StubView({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center text-center gap-3" style={{ padding: '64px 16px' }}>
      <div className="icon-btn" style={{ width: 52, height: 52, borderRadius: '50%', cursor: 'default' }}>
        <Icon size={22} />
      </div>
      <h2 className="font-display text-xl">{title}</h2>
      <p className="text-sm max-w-sm" style={{ color: 'var(--ink-light)' }}>{description}</p>
      <span className="pill" style={{ background: 'var(--tan-tint)', color: 'var(--tan-text)' }}>Bientôt disponible</span>
    </div>
  );
}

function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn" style={{ position: 'absolute', top: 14, right: 14 }} onClick={onCancel}><X size={14} /></button>
        <h3 className="font-display text-lg">{title}</h3>
        <p className="text-sm mt-2" style={{ color: 'var(--ink-light)' }}>{message}</p>
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-secondary" onClick={onCancel}>Annuler</button>
          <button className="btn-primary" style={{ background: 'var(--red)' }} onClick={onConfirm}>{confirmLabel || 'Supprimer'}</button>
        </div>
      </div>
    </div>
  );
}

function ProjectFormModal({ initial, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [startDate, setStartDate] = useState(initial?.startDate || '');
  const [endDate, setEndDate] = useState(initial?.endDate || '');
  const [status, setStatus] = useState(initial?.status || 'a_venir');
  const [error, setError] = useState('');

  function handleSubmit() {
    if (!name.trim()) {
      setError('Le nom est obligatoire.');
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      setError('La date de fin doit être après la date de début.');
      return;
    }
    onSubmit({ name, description, startDate, endDate, status });
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn" style={{ position: 'absolute', top: 14, right: 14 }} onClick={onCancel}><X size={14} /></button>
        <h3 className="font-display text-lg">{initial ? 'Modifier le projet' : 'Nouveau projet'}</h3>
        <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label>Nom du projet</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Tournoi des jeunes" autoFocus />
          </div>
          <div>
            <label>Description</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optionnel" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label>Début</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label>Fin</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label>Statut</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="a_venir">À venir</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
            </select>
          </div>
          {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-secondary" onClick={onCancel}>Annuler</button>
          <button className="btn-primary" onClick={handleSubmit}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

function TaskQuickAddForm({ defaultAssignee, users, onAdd }) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState(defaultAssignee || (users[0] && users[0].displayName) || '');

  function submit() {
    if (!title.trim()) return;
    onAdd({ title, dueDate, assignee: assignee || defaultAssignee });
    setTitle('');
    setDueDate('');
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 mt-3" style={{ paddingTop: '12px', borderTop: '1px dashed var(--line)' }}>
      <input
        type="text"
        placeholder="Ajouter une tâche…"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        style={{ flex: 2 }}
      />
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ flex: 1 }} />
      <select value={assignee} onChange={(e) => setAssignee(e.target.value)} style={{ flex: 1 }}>
        {users.map((u) => (
          <option key={u.username} value={u.displayName}>{u.displayName}</option>
        ))}
      </select>
      <button className="btn-primary" onClick={submit}><Plus size={14} /> Ajouter</button>
    </div>
  );
}

function CalendarView({ monthDate, tasksByDate, getProjectColor, selectedDay, onSelectDay, onPrevMonth, onNextMonth }) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const cells = useMemo(() => getMonthMatrix(year, month), [year, month]);
  const monthLabel = `${MONTHS_FR[month]} ${year}`;
  const today = todayISO();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button className="icon-btn" onClick={onPrevMonth}><ChevronLeft size={16} /></button>
        <h2 className="font-display uppercase" style={{ letterSpacing: '0.05em' }}>{monthLabel}</h2>
        <button className="icon-btn" onClick={onNextMonth}><ChevronRight size={16} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {DAYS_FR.map((d) => (
          <div key={d} className="text-xs font-semibold" style={{ color: 'var(--ink-light)' }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const dayTasks = tasksByDate[cell.iso] || [];
          const isToday = cell.iso === today;
          const isSelected = cell.iso === selectedDay;
          return (
            <button
              key={cell.iso}
              className="calendar-cell"
              onClick={() => onSelectDay(cell.iso)}
              style={{
                opacity: cell.currentMonth ? 1 : 0.35,
                borderColor: isSelected ? 'var(--pitch)' : 'var(--line)',
                background: isToday ? 'var(--pitch-tint)' : 'var(--white)',
              }}
            >
              <span className="text-xs font-semibold">{cell.day}</span>
              <div className="flex gap-0.5 flex-wrap justify-center mt-1">
                {dayTasks.slice(0, 3).map((t) => (
                  <span key={t.id} className="dot" style={{ background: getProjectColor(t.projectId) }} />
                ))}
                {dayTasks.length > 3 && <span className="text-xs" style={{ color: 'var(--ink-light)' }}>+{dayTasks.length - 3}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PlanningList({ tasks, getProject }) {
  const notDone = tasks
    .filter((t) => t.status !== 'termine' && t.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const overdue = notDone.filter((t) => daysBetween(t.dueDate) < 0);
  const thisWeek = notDone.filter((t) => daysBetween(t.dueDate) >= 0 && daysBetween(t.dueDate) <= 7);
  const later = notDone.filter((t) => daysBetween(t.dueDate) > 7);

  function Section({ title, color, items }) {
    if (items.length === 0) return null;
    return (
      <div className="mb-5">
        <h3 className="text-xs font-semibold uppercase mb-2" style={{ color, letterSpacing: '0.05em' }}>{title} — {items.length}</h3>
        <div className="flex flex-col">
          {items.map((t) => {
            const project = getProject(t.projectId);
            return (
              <div key={t.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--line)' }}>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{t.title}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--ink-light)' }}>{project ? project.name : 'Projet supprimé'} · {t.assignee}</p>
                </div>
                <span className="text-xs" style={{ color, whiteSpace: 'nowrap', marginLeft: '8px' }}>{formatDateFR(t.dueDate)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (notDone.length === 0) {
    return <p className="text-sm" style={{ color: 'var(--ink-light)' }}>Aucune échéance à venir. Ajoute des dates à tes tâches pour les voir apparaître ici.</p>;
  }

  return (
    <div>
      <Section title="En retard" color="var(--red)" items={overdue} />
      <Section title="Cette semaine" color="var(--pitch-dark)" items={thisWeek} />
      <Section title="Plus tard" color="var(--ink-light)" items={later} />
    </div>
  );
}

/* ---------------------------------------------------------------
   Authentification & administration
--------------------------------------------------------------- */

function BootstrapAdminForm({ onCreate, busy }) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  function submit() {
    if (!username.trim()) {
      setError('Choisis un identifiant.');
      return;
    }
    if (password.length < 4) {
      setError('Le mot de passe doit faire au moins 4 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setError('');
    onCreate({ username: username.trim(), displayName: displayName.trim() || username.trim(), password });
  }

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '65vh' }}>
      <div className="modal-card" style={{ maxWidth: 380, width: '100%' }}>
        <h2 className="font-display text-xl">Bienvenue dans Mêlée</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-light)' }}>Crée le compte administrateur pour démarrer l'espace de ton équipe.</p>
        <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label>Identifiant</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ex. julien" autoFocus />
          </div>
          <div>
            <label>Nom affiché (optionnel)</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ex. Julien" />
          </div>
          <div>
            <label>Mot de passe</label>
            <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} placeholder="4 caractères minimum" />
          </div>
          <div>
            <label>Confirmer le mot de passe</label>
            <PasswordField value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          </div>
          {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
        </div>
        <button className="btn-primary" style={{ width: '100%', marginTop: '18px' }} onClick={submit} disabled={busy}>
          {busy ? 'Création…' : 'Créer le compte et démarrer'}
        </button>
      </div>
    </div>
  );
}

function LoginForm({ onLogin, busy, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function submit() {
    if (!username.trim() || !password) return;
    onLogin(username.trim(), password);
  }

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '65vh' }}>
      <div className="modal-card" style={{ maxWidth: 360, width: '100%' }}>
        <h2 className="font-display text-xl">Connexion</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-light)' }}>Entre tes identifiants pour rejoindre l'espace de l'équipe.</p>
        <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label>Identifiant</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && submit()} />
          </div>
          <div>
            <label>Mot de passe</label>
            <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          </div>
          {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
        </div>
        <button className="btn-primary" style={{ width: '100%', marginTop: '18px' }} onClick={submit} disabled={busy}>
          {busy ? 'Connexion…' : 'Se connecter'}
        </button>
        <p className="text-xs mt-3" style={{ color: 'var(--ink-light)', textAlign: 'center' }}>Pas encore de compte ? Demande à l'administrateur de t'en créer un.</p>
      </div>
    </div>
  );
}

function CreateUserModal({ onSubmit, onCancel, existingUsernames }) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState(() => generatePassword());
  const [role, setRole] = useState('membre');
  const [error, setError] = useState('');

  function submit() {
    const uname = username.trim();
    if (!uname) {
      setError('Choisis un identifiant.');
      return;
    }
    if (existingUsernames.includes(uname.toLowerCase())) {
      setError('Cet identifiant existe déjà.');
      return;
    }
    if (password.length < 4) {
      setError('Le mot de passe doit faire au moins 4 caractères.');
      return;
    }
    onSubmit({ username: uname, displayName: displayName.trim() || uname, password, role });
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn" style={{ position: 'absolute', top: 14, right: 14 }} onClick={onCancel}><X size={14} /></button>
        <h3 className="font-display text-lg">Nouveau membre</h3>
        <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label>Identifiant</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ex. marie" autoFocus />
          </div>
          <div>
            <label>Nom affiché (optionnel)</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ex. Marie" />
          </div>
          <div>
            <label>Mot de passe temporaire</label>
            <div className="flex gap-2">
              <div style={{ flex: 1 }}>
                <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button className="btn-secondary" type="button" onClick={() => setPassword(generatePassword())}>Générer</button>
            </div>
          </div>
          <div>
            <label>Rôle</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="membre">Membre</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-secondary" onClick={onCancel}>Annuler</button>
          <button className="btn-primary" onClick={submit}>Créer le compte</button>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordModal({ user, onSubmit, onCancel }) {
  const [password, setPassword] = useState(() => generatePassword());
  const [error, setError] = useState('');

  function submit() {
    if (password.length < 4) {
      setError('Le mot de passe doit faire au moins 4 caractères.');
      return;
    }
    onSubmit(password);
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn" style={{ position: 'absolute', top: 14, right: 14 }} onClick={onCancel}><X size={14} /></button>
        <h3 className="font-display text-lg">Réinitialiser le mot de passe</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-light)' }}>Nouveau mot de passe pour {user.displayName}.</p>
        <div className="mt-4">
          <div className="flex gap-2">
            <div style={{ flex: 1 }}>
              <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
            </div>
            <button className="btn-secondary" type="button" onClick={() => setPassword(generatePassword())}>Générer</button>
          </div>
          {error && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{error}</p>}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-secondary" onClick={onCancel}>Annuler</button>
          <button className="btn-primary" onClick={submit}>Réinitialiser</button>
        </div>
      </div>
    </div>
  );
}

function CredentialsRevealModal({ username, password, displayName, onClose }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = `Identifiant : ${username}\nMot de passe : ${password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      /* copie manuelle si le presse-papier est indisponible */
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn" style={{ position: 'absolute', top: 14, right: 14 }} onClick={onClose}><X size={14} /></button>
        <h3 className="font-display text-lg">Compte prêt</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-light)' }}>Transmets ces identifiants à {displayName} — ils ne seront plus affichés ensuite.</p>
        <div className="mt-4" style={{ background: 'var(--chalk)', border: '1px solid var(--line)', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.8 }}>
          <div>Identifiant : <strong>{username}</strong></div>
          <div>Mot de passe : <strong>{password}</strong></div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-secondary" onClick={copy}><Copy size={13} /> {copied ? 'Copié !' : 'Copier'}</button>
          <button className="btn-primary" onClick={onClose}>Terminé</button>
        </div>
      </div>
    </div>
  );
}

function ChangePasswordModal({ onSubmit, onCancel, error, busy }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');

  function submit() {
    if (next.length < 4) {
      setLocalError('Le nouveau mot de passe doit faire au moins 4 caractères.');
      return;
    }
    if (next !== confirm) {
      setLocalError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setLocalError('');
    onSubmit(current, next);
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn" style={{ position: 'absolute', top: 14, right: 14 }} onClick={onCancel}><X size={14} /></button>
        <h3 className="font-display text-lg">Changer mon mot de passe</h3>
        <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label>Mot de passe actuel</label>
            <PasswordField value={current} onChange={(e) => setCurrent(e.target.value)} autoFocus />
          </div>
          <div>
            <label>Nouveau mot de passe</label>
            <PasswordField value={next} onChange={(e) => setNext(e.target.value)} />
          </div>
          <div>
            <label>Confirmer</label>
            <PasswordField value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
          </div>
          {(localError || error) && <p className="text-xs" style={{ color: 'var(--red)' }}>{localError || error}</p>}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-secondary" onClick={onCancel}>Annuler</button>
          <button className="btn-primary" onClick={submit} disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ users, session, onCreateClick, onResetClick, onToggleRole, onDeleteClick }) {
  const adminCount = users.filter((u) => u.role === 'admin').length;
  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h1 className="font-display text-2xl">Administration</h1>
        <button className="btn-primary" onClick={onCreateClick}><UserPlus size={15} /> Nouveau membre</button>
      </div>
      <div className="pitch-divider"></div>
      <div className="flex flex-col">
        {users.map((u) => {
          const isSelf = u.username.toLowerCase() === session.username.toLowerCase();
          const isSoleAdmin = u.role === 'admin' && adminCount === 1;
          return (
            <div key={u.username} className="flex items-center justify-between gap-2 py-3 flex-wrap" style={{ borderBottom: '1px solid var(--line)' }}>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold">{u.displayName}</p>
                  <RoleBadge role={u.role} />
                  {isSelf && <span className="text-xs" style={{ color: 'var(--ink-light)' }}>(toi)</span>}
                </div>
                <p className="text-xs" style={{ color: 'var(--ink-light)' }}>@{u.username}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="icon-btn"
                  title={isSoleAdmin ? "Impossible : c'est le seul admin" : u.role === 'admin' ? 'Rétrograder en membre' : 'Promouvoir admin'}
                  disabled={isSoleAdmin}
                  onClick={() => !isSoleAdmin && onToggleRole(u)}
                >
                  <Shield size={14} />
                </button>
                <button className="icon-btn" title="Réinitialiser le mot de passe" onClick={() => onResetClick(u)}>
                  <KeyRound size={14} />
                </button>
                <button
                  className="icon-btn"
                  title={isSoleAdmin ? "Impossible : c'est le seul admin" : 'Supprimer le compte'}
                  disabled={isSoleAdmin}
                  onClick={() => !isSoleAdmin && onDeleteClick(u)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   App principale
--------------------------------------------------------------- */

export default function MeleeApp() {
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordBusy, setChangePasswordBusy] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState(null);
  const [credentialsReveal, setCredentialsReveal] = useState(null);

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [toast, setToast] = useState(null);

  const [activeTab, setActiveTab] = useState('home');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  const [planningView, setPlanningView] = useState('calendar');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUsersWithRetry() {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const r = await window.storage.get('users', true);
          return r && r.value ? JSON.parse(r.value) : [];
        } catch (e) {
          if (attempt === 0) await new Promise((res) => setTimeout(res, 400));
        }
      }
      return [];
    }

    async function load() {
      let loadedSession = null;
      try {
        const r = await window.storage.get('session', false);
        if (r && r.value) loadedSession = JSON.parse(r.value);
      } catch (e) {
        /* pas de session mémorisée */
      }
      const loadedUsers = await loadUsersWithRetry();
      let loadedProjects = [];
      try {
        const r = await window.storage.get('projects', true);
        if (r && r.value) loadedProjects = JSON.parse(r.value);
      } catch (e) {
        /* aucun projet encore */
      }
      let loadedTasks = [];
      try {
        const r = await window.storage.get('tasks', true);
        if (r && r.value) loadedTasks = JSON.parse(r.value);
      } catch (e) {
        /* aucune tâche encore */
      }
      if (!cancelled) {
        setUsers(loadedUsers);
        setProjects(loadedProjects);
        setTasks(loadedTasks);
        setSession(loadedSession);
        setDataLoaded(true);
        setLastSync(new Date());
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Garde la session cohérente avec l'annuaire des comptes (suppression / changement de rôle par un admin)
  useEffect(() => {
    if (dataLoaded && session && users.length > 0) {
      const stillExists = users.find((u) => u.username.toLowerCase() === session.username.toLowerCase());
      if (!stillExists) {
        setSession(null);
        window.storage.delete('session', false).catch(() => {});
        showToast('Ton compte a été supprimé par un administrateur.');
      } else if (stillExists.role !== session.role || stillExists.displayName !== session.displayName) {
        const updated = { username: stillExists.username, displayName: stillExists.displayName, role: stillExists.role };
        setSession(updated);
        window.storage.set('session', JSON.stringify(updated), false).catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, dataLoaded]);

  function showToast(message) {
    setToast({ message });
    setTimeout(() => setToast(null), 3500);
  }

  // Va rechercher les données partagées (comptes, projets, tâches) sans jamais effacer
  // ce qui est déjà affiché si une lecture échoue ponctuellement — sûr à appeler en fond.
  async function refreshSharedData(manual) {
    if (manual) setSyncing(true);
    const results = await Promise.allSettled([
      window.storage.get('users', true),
      window.storage.get('projects', true),
      window.storage.get('tasks', true),
    ]);
    const [usersRes, projectsRes, tasksRes] = results;
    if (usersRes.status === 'fulfilled' && usersRes.value && usersRes.value.value) {
      setUsers(JSON.parse(usersRes.value.value));
    }
    if (projectsRes.status === 'fulfilled' && projectsRes.value && projectsRes.value.value) {
      setProjects(JSON.parse(projectsRes.value.value));
    }
    if (tasksRes.status === 'fulfilled' && tasksRes.value && tasksRes.value.value) {
      setTasks(JSON.parse(tasksRes.value.value));
    }
    setLastSync(new Date());
    if (manual) setSyncing(false);
  }

  // Synchronisation automatique en arrière-plan pendant que l'appli est ouverte et connectée
  useEffect(() => {
    if (!dataLoaded || !session) return;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshSharedData(false);
      }
    }, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoaded, session]);

  async function persistUsers(next) {
    setUsers(next);
    try {
      const r = await window.storage.set('users', JSON.stringify(next), true);
      if (!r) showToast("La sauvegarde n'a pas fonctionné, réessaie.");
    } catch (e) {
      showToast("La sauvegarde n'a pas fonctionné, réessaie.");
    }
  }

  async function persistProjects(next) {
    setProjects(next);
    try {
      const r = await window.storage.set('projects', JSON.stringify(next), true);
      if (!r) showToast("La sauvegarde n'a pas fonctionné, réessaie.");
    } catch (e) {
      showToast("La sauvegarde n'a pas fonctionné, réessaie.");
    }
  }

  async function persistTasks(next) {
    setTasks(next);
    try {
      const r = await window.storage.set('tasks', JSON.stringify(next), true);
      if (!r) showToast("La sauvegarde n'a pas fonctionné, réessaie.");
    } catch (e) {
      showToast("La sauvegarde n'a pas fonctionné, réessaie.");
    }
  }

  async function handleBootstrapCreate({ username, displayName, password }) {
    setAuthBusy(true);
    setAuthError('');
    try {
      const passwordHash = await hashPassword(username, password);
      const newUser = { username, displayName, role: 'admin', passwordHash, createdAt: Date.now(), createdBy: null };
      await persistUsers([newUser]);
      const newSession = { username, displayName, role: 'admin' };
      setSession(newSession);
      try {
        await window.storage.set('session', JSON.stringify(newSession), false);
      } catch (e) {
        showToast("Ta session n'a pas pu être mémorisée, il faudra te reconnecter la prochaine fois.");
      }
    } catch (e) {
      setAuthError('La création du compte a échoué. Réessaie.');
    }
    setAuthBusy(false);
  }

  async function handleLogin(username, password) {
    setAuthBusy(true);
    setAuthError('');
    try {
      const match = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
      if (!match) {
        setAuthError('Identifiant ou mot de passe incorrect.');
        setAuthBusy(false);
        return;
      }
      const hash = await hashPassword(match.username, password);
      if (hash !== match.passwordHash) {
        setAuthError('Identifiant ou mot de passe incorrect.');
        setAuthBusy(false);
        return;
      }
      const newSession = { username: match.username, displayName: match.displayName, role: match.role };
      setSession(newSession);
      try {
        await window.storage.set('session', JSON.stringify(newSession), false);
      } catch (e) {
        showToast("Ta session n'a pas pu être mémorisée, il faudra te reconnecter la prochaine fois.");
      }
    } catch (e) {
      setAuthError('La connexion a échoué. Réessaie.');
    }
    setAuthBusy(false);
  }

  function handleLogout() {
    setSession(null);
    setShowUserMenu(false);
    window.storage.delete('session', false).catch(() => {});
    setActiveTab('home');
    setSelectedProjectId(null);
  }

  async function handleChangeOwnPassword(currentPassword, newPassword) {
    setChangePasswordBusy(true);
    setChangePasswordError('');
    try {
      const me = users.find((u) => u.username.toLowerCase() === session.username.toLowerCase());
      if (!me) {
        setChangePasswordError('Compte introuvable.');
        setChangePasswordBusy(false);
        return;
      }
      const currentHash = await hashPassword(me.username, currentPassword);
      if (currentHash !== me.passwordHash) {
        setChangePasswordError('Mot de passe actuel incorrect.');
        setChangePasswordBusy(false);
        return;
      }
      const newHash = await hashPassword(me.username, newPassword);
      await persistUsers(users.map((u) => (u.username === me.username ? { ...u, passwordHash: newHash } : u)));
      setShowChangePassword(false);
      showToast('Mot de passe mis à jour.');
    } catch (e) {
      setChangePasswordError('La mise à jour a échoué. Réessaie.');
    }
    setChangePasswordBusy(false);
  }

  async function handleCreateUser({ username, displayName, password, role }) {
    const passwordHash = await hashPassword(username, password);
    const newUser = { username, displayName, role, passwordHash, createdAt: Date.now(), createdBy: session.username };
    await persistUsers([...users, newUser]);
    setShowCreateUser(false);
    setCredentialsReveal({ username, password, displayName });
  }

  async function handleResetPassword(user, newPassword) {
    const passwordHash = await hashPassword(user.username, newPassword);
    await persistUsers(users.map((u) => (u.username === user.username ? { ...u, passwordHash } : u)));
    setResetTargetUser(null);
    setCredentialsReveal({ username: user.username, password: newPassword, displayName: user.displayName });
  }

  function handleToggleRole(user) {
    const newRole = user.role === 'admin' ? 'membre' : 'admin';
    persistUsers(users.map((u) => (u.username === user.username ? { ...u, role: newRole } : u)));
  }

  function handleDeleteUser(user) {
    persistUsers(users.filter((u) => u.username !== user.username));
    if (session && session.username.toLowerCase() === user.username.toLowerCase()) {
      handleLogout();
    }
  }

  function handleSubmitProjectForm(data) {
    if (editingProject) {
      persistProjects(projects.map((p) => (p.id === editingProject.id ? { ...p, ...data } : p)));
    } else {
      const newProject = {
        id: genId(),
        name: data.name.trim(),
        description: data.description.trim(),
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        color: PROJECT_COLORS[projects.length % PROJECT_COLORS.length],
        createdBy: session.displayName,
        createdAt: Date.now(),
      };
      persistProjects([...projects, newProject]);
    }
    setShowProjectForm(false);
    setEditingProject(null);
  }

  function handleDeleteProject(id) {
    persistProjects(projects.filter((p) => p.id !== id));
    persistTasks(tasks.filter((t) => t.projectId !== id));
  }

  function handleAddTask(projectId, data) {
    const newTask = {
      id: genId(),
      projectId,
      title: data.title.trim(),
      dueDate: data.dueDate || '',
      assignee: data.assignee || session.displayName,
      status: 'a_venir',
      createdBy: session.displayName,
      createdAt: Date.now(),
    };
    persistTasks([...tasks, newTask]);
  }

  function handleToggleTaskStatus(task) {
    const idx = STATUS_ORDER.indexOf(task.status);
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    persistTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: next } : t)));
  }

  function handleDeleteTask(id) {
    persistTasks(tasks.filter((t) => t.id !== id));
  }

  function getProject(id) {
    return projects.find((p) => p.id === id);
  }

  function getProjectColor(id) {
    const p = getProject(id);
    return p ? p.color : '#999';
  }

  function goToTab(id) {
    setActiveTab(id);
    setSelectedProjectId(null);
    setSelectedDay(null);
  }

  const selectedProject = selectedProjectId ? getProject(selectedProjectId) : null;
  const selectedProjectTasks = selectedProject ? tasks.filter((t) => t.projectId === selectedProject.id) : [];

  const activeProjectsCount = projects.filter((p) => p.status === 'en_cours').length;
  const todoTasksCount = tasks.filter((t) => t.status !== 'termine').length;
  const overdueTasksCount = tasks.filter((t) => t.status !== 'termine' && t.dueDate && daysBetween(t.dueDate) < 0).length;

  const upcomingTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.status !== 'termine' && t.dueDate)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 5),
    [tasks]
  );

  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (t.dueDate) {
        if (!map[t.dueDate]) map[t.dueDate] = [];
        map[t.dueDate].push(t);
      }
    });
    return map;
  }, [tasks]);

  const now = new Date();
  const todayLabelFR = `${DAYS_FULL_FR[now.getDay()]} ${now.getDate()} ${MONTHS_FR[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="melee-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Work+Sans:wght@400;500;600;700&display=swap');

        .melee-app {
          --pitch-dark:#16352A;
          --pitch:#2D6A4F;
          --pitch-tint:#E3EEE8;
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
          font-family:'Work Sans', sans-serif;
          background:var(--chalk);
          color:var(--ink);
          min-height:100vh;
        }
        .melee-app *, .melee-app *::before, .melee-app *::after { box-sizing:border-box; }
        .melee-app .font-display { font-family:'Oswald', sans-serif; }
        .melee-app :focus-visible { outline:2px solid var(--pitch); outline-offset:2px; }
        .melee-app button:disabled { opacity:0.5; cursor:not-allowed; }

        .melee-app .app-header {
          background:var(--pitch-dark);
          color:var(--chalk);
          padding:14px 20px;
          display:flex; align-items:center; justify-content:space-between;
          position:sticky; top:0; z-index:20;
        }
        .melee-app .logo-mark { width:10px; height:10px; background:var(--amber); border-radius:2px; transform:rotate(45deg); display:inline-block; }
        .melee-app .user-badge {
          display:flex; align-items:center; gap:6px;
          background:rgba(247,245,240,0.1);
          border:1px solid rgba(247,245,240,0.25);
          color:var(--chalk);
          padding:6px 10px; border-radius:999px; font-size:13px; cursor:pointer;
          transition:background 0.15s ease;
        }
        .melee-app .user-badge:hover { background:rgba(247,245,240,0.2); }
        .melee-app .header-icon-btn {
          display:inline-flex; align-items:center; justify-content:center;
          width:32px; height:32px; border-radius:8px; border:1px solid rgba(247,245,240,0.25);
          background:rgba(247,245,240,0.1); cursor:pointer; color:var(--chalk);
          transition:background 0.15s ease;
        }
        .melee-app .header-icon-btn:hover { background:rgba(247,245,240,0.2); }

        .melee-app .user-menu {
          position:absolute; top:calc(100% + 6px); right:0; background:var(--white); border:1px solid var(--line); border-radius:10px;
          box-shadow:0 10px 24px rgba(0,0,0,0.15); padding:6px; min-width:210px; z-index:30;
        }
        .melee-app .user-menu button {
          display:flex; align-items:center; gap:8px; width:100%; text-align:left; padding:8px 10px; border-radius:6px; border:none; background:none; font-size:13px; color:var(--ink); cursor:pointer;
        }
        .melee-app .user-menu button:hover { background:var(--chalk); }

        .melee-app .app-nav {
          display:flex; gap:4px; overflow-x:auto;
          background:var(--white);
          border-bottom:1px solid var(--line);
          padding:0 12px;
        }
        .melee-app .nav-tab {
          display:flex; align-items:center; gap:6px; white-space:nowrap;
          padding:12px 12px; font-size:13px; font-weight:600; color:var(--ink-light);
          border-bottom:2px solid transparent; cursor:pointer; background:none; border-top:none; border-left:none; border-right:none;
          transition:color 0.15s ease, border-color 0.15s ease;
        }
        .melee-app .nav-tab:hover { color:var(--ink); }
        .melee-app .nav-tab.active { color:var(--pitch-dark); border-bottom-color:var(--pitch); }
        .melee-app .stub-dot { width:5px; height:5px; border-radius:50%; background:var(--tan); margin-left:2px; }

        .melee-app .pitch-divider {
          height:6px; margin:16px 0;
          background-image: repeating-linear-gradient(90deg, var(--line) 0 14px, transparent 14px 22px);
          opacity:0.8;
        }

        .melee-app .card {
          background:var(--white); border:1px solid var(--line); border-radius:12px;
          padding:16px; cursor:pointer; transition:transform 0.15s ease, box-shadow 0.15s ease;
        }
        .melee-app .card:hover { transform:translateY(-2px); box-shadow:0 6px 16px rgba(22,53,42,0.08); }

        .melee-app .score { font-family:'Oswald', sans-serif; font-size:22px; font-weight:600; font-variant-numeric:tabular-nums; }

        .melee-app .pill {
          display:inline-flex; align-items:center; gap:4px;
          padding:2px 9px; border-radius:999px; font-size:11px; font-weight:600;
          text-transform:uppercase; letter-spacing:0.03em;
        }

        .melee-app .btn-primary {
          display:inline-flex; align-items:center; gap:6px; justify-content:center;
          background:var(--pitch-dark); color:var(--chalk); font-weight:600; font-size:14px;
          padding:9px 16px; border-radius:9px; cursor:pointer; border:none;
          transition:background 0.15s ease;
        }
        .melee-app .btn-primary:hover { background:var(--pitch); }
        .melee-app .btn-secondary {
          display:inline-flex; align-items:center; gap:6px; justify-content:center;
          background:var(--white); color:var(--ink); font-weight:600; font-size:14px;
          padding:9px 16px; border-radius:9px; cursor:pointer; border:1px solid var(--line);
          transition:background 0.15s ease;
        }
        .melee-app .btn-secondary:hover { background:var(--chalk); }
        .melee-app .icon-btn {
          display:inline-flex; align-items:center; justify-content:center;
          width:32px; height:32px; border-radius:8px; border:1px solid var(--line);
          background:var(--white); cursor:pointer; color:var(--ink-light);
          transition:background 0.15s ease, color 0.15s ease;
        }
        .melee-app .icon-btn:hover { background:var(--chalk); color:var(--ink); }

        .melee-app input[type=text], .melee-app input[type=password], .melee-app input[type=date], .melee-app textarea, .melee-app select {
          width:100%; border:1px solid var(--line); border-radius:8px; padding:8px 10px;
          font-family:'Work Sans', sans-serif; font-size:14px; background:var(--white); color:var(--ink);
        }
        .melee-app input:focus, .melee-app textarea:focus, .melee-app select:focus { border-color:var(--pitch); }
        .melee-app label { font-size:12px; font-weight:600; color:var(--ink-light); text-transform:uppercase; letter-spacing:0.03em; display:block; margin-bottom:4px; }

        .melee-app .modal-overlay {
          position:fixed; inset:0; background:rgba(22,53,42,0.45); backdrop-filter:blur(2px);
          display:flex; align-items:center; justify-content:center; z-index:50; padding:16px;
        }
        .melee-app .modal-card {
          background:var(--white); border-radius:14px; padding:22px; width:100%; max-width:420px;
          max-height:90vh; overflow-y:auto;
          animation: melee-pop-in 0.18s ease;
        }
        @keyframes melee-pop-in { from { opacity:0; transform:scale(0.97) translateY(4px);} to {opacity:1; transform:none;} }

        .melee-app .toast {
          position:fixed; bottom:20px; right:20px; left:20px; z-index:60; margin-left:auto; max-width:320px;
          background:var(--red); color:var(--white); padding:10px 16px; border-radius:9px; font-size:13px;
          box-shadow:0 6px 20px rgba(0,0,0,0.2);
        }

        .melee-app .calendar-cell {
          aspect-ratio:1; border:1px solid var(--line); border-radius:8px; background:var(--white);
          display:flex; flex-direction:column; align-items:center; justify-content:flex-start; padding:4px;
          cursor:pointer; transition:border-color 0.15s ease;
        }
        .melee-app .calendar-cell:hover { border-color:var(--pitch); }
        .melee-app .dot { width:6px; height:6px; border-radius:50%; }

        .melee-app .stat-card { background:var(--white); border:1px solid var(--line); border-radius:12px; padding:16px; }

        .melee-app .fade-in { animation: melee-fade-in 0.2s ease; }
        @keyframes melee-fade-in { from{opacity:0; transform:translateY(4px);} to{opacity:1; transform:none;} }

        @media (prefers-reduced-motion: reduce) {
          .melee-app * { animation:none !important; transition:none !important; }
        }
      `}</style>

      <header className="app-header">
        <div className="flex items-center gap-2">
          <span className="logo-mark"></span>
          <span className="font-display text-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>Mêlée</span>
        </div>
        {dataLoaded && session && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
            <button
              className="header-icon-btn"
              title={lastSync ? `Synchronisé à ${formatTime(lastSync)} — cliquer pour actualiser` : 'Actualiser'}
              onClick={() => refreshSharedData(true)}
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            </button>
            {session.role === 'admin' && (
              <button className="header-icon-btn" title="Administration" onClick={() => goToTab('admin')}>
                <Shield size={15} />
              </button>
            )}
            <button className="user-badge" onClick={() => setShowUserMenu((s) => !s)}>
              <User size={13} /> {session.displayName}
            </button>
            {showUserMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 25 }} onClick={() => setShowUserMenu(false)}></div>
                <div className="user-menu">
                  <button onClick={() => { setShowUserMenu(false); setShowChangePassword(true); }}><KeyRound size={13} /> Changer mon mot de passe</button>
                  <button onClick={handleLogout}><LogOut size={13} /> Se déconnecter</button>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {dataLoaded && session && (
        <nav className="app-nav">
          {TABS.map((tab) => (
            <button key={tab.id} className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => goToTab(tab.id)}>
              <tab.icon size={15} /> {tab.label} {tab.stub && <span className="stub-dot"></span>}
            </button>
          ))}
        </nav>
      )}

      <main className="max-w-5xl mx-auto" style={{ padding: '20px 16px 60px' }}>
        {!dataLoaded ? (
          <div className="flex items-center justify-center" style={{ padding: '80px 0' }}>
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--pitch)' }} />
          </div>
        ) : !session ? (
          users.length === 0 ? (
            <BootstrapAdminForm onCreate={handleBootstrapCreate} busy={authBusy} />
          ) : (
            <LoginForm onLogin={handleLogin} busy={authBusy} error={authError} />
          )
        ) : (
          <div key={activeTab + (selectedProject ? selectedProject.id : '')} className="fade-in">
            {activeTab === 'home' && (
              <div>
                <h1 className="font-display text-2xl">Bonjour, {session.displayName} 👋</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--ink-light)' }}>{todayLabelFR}</p>
                <div className="pitch-divider"></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard icon={FolderKanban} label="Projets en cours" value={activeProjectsCount} />
                  <StatCard icon={Clock} label="Tâches à faire" value={todoTasksCount} />
                  <StatCard icon={AlertOctagon} label="En retard" value={overdueTasksCount} danger />
                </div>
                <div className="mt-8">
                  <h2 className="font-display text-lg mb-2">Prochaines échéances</h2>
                  {upcomingTasks.length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--ink-light)' }}>Aucune échéance pour l'instant.</p>
                  ) : (
                    <div>
                      {upcomingTasks.map((t) => {
                        const project = getProject(t.projectId);
                        const overdue = daysBetween(t.dueDate) < 0;
                        return (
                          <div key={t.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--line)' }}>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{t.title}</p>
                              <p className="text-xs truncate" style={{ color: 'var(--ink-light)' }}>{project ? project.name : ''}</p>
                            </div>
                            <span className="text-xs" style={{ color: overdue ? 'var(--red)' : 'var(--ink-light)', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                              {formatDateFR(t.dueDate)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="mt-8">
                  <h2 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--ink-light)', letterSpacing: '0.05em' }}>À venir dans l'appli</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button className="card" style={{ textAlign: 'left', width: '100%', font: 'inherit', borderTop: '4px solid var(--tan)' }} onClick={() => goToTab('cycles')}>
                      <Dumbbell size={18} style={{ color: 'var(--tan)' }} />
                      <p className="font-display text-sm mt-2">Cycles rugby</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--ink-light)' }}>Prépa physique & séances</p>
                    </button>
                    <button className="card" style={{ textAlign: 'left', width: '100%', font: 'inherit', borderTop: '4px solid var(--pitch)' }} onClick={() => goToTab('chat')}>
                      <MessageSquare size={18} style={{ color: 'var(--pitch)' }} />
                      <p className="font-display text-sm mt-2">Chat d'équipe</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--ink-light)' }}>Discuter en direct</p>
                    </button>
                    <button className="card" style={{ textAlign: 'left', width: '100%', font: 'inherit', borderTop: '4px solid #3D5A80' }} onClick={() => goToTab('docs')}>
                      <FileText size={18} style={{ color: '#3D5A80' }} />
                      <p className="font-display text-sm mt-2">Documents</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--ink-light)' }}>Partager les fichiers du club</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && !selectedProject && (
              <div>
                <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                  <h1 className="font-display text-2xl">Projets</h1>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setEditingProject(null);
                      setShowProjectForm(true);
                    }}
                  >
                    <Plus size={15} /> Nouveau projet
                  </button>
                </div>
                <div className="pitch-divider"></div>
                {projects.length === 0 ? (
                  <div className="text-center" style={{ padding: '48px 16px' }}>
                    <p className="text-sm" style={{ color: 'var(--ink-light)' }}>Aucun projet pour l'instant. Crée le premier pour lancer la saison.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((p) => (
                      <ProjectCard key={p.id} project={p} tasks={tasks} onClick={() => setSelectedProjectId(p.id)} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'projects' && selectedProject && (
              <div>
                <button className="btn-secondary" style={{ marginBottom: '16px' }} onClick={() => setSelectedProjectId(null)}>
                  <ChevronLeft size={14} /> Projets
                </button>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="font-display text-2xl">{selectedProject.name}</h1>
                      <StatusPill status={selectedProject.status} />
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--ink-light)' }}>{formatRange(selectedProject.startDate, selectedProject.endDate)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="icon-btn"
                      onClick={() => {
                        setEditingProject(selectedProject);
                        setShowProjectForm(true);
                      }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() =>
                        setConfirmState({
                          message: `Supprimer "${selectedProject.name}" et ses ${selectedProjectTasks.length} tâche(s) ?`,
                          onConfirm: () => {
                            handleDeleteProject(selectedProject.id);
                            setConfirmState(null);
                          },
                        })
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {selectedProject.description && <p className="text-sm mt-3">{selectedProject.description}</p>}
                <div className="pitch-divider"></div>
                <h2 className="font-display text-lg mb-2">
                  Tâches{' '}
                  <span style={{ color: 'var(--ink-light)', fontFamily: "'Work Sans', sans-serif", fontWeight: 400, fontSize: '14px' }}>
                    ({selectedProjectTasks.filter((t) => t.status === 'termine').length} / {selectedProjectTasks.length})
                  </span>
                </h2>
                {selectedProjectTasks.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--ink-light)' }}>Pas encore de tâche. Ajoute la première ci-dessous.</p>
                ) : (
                  <div>
                    {selectedProjectTasks
                      .slice()
                      .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
                      .map((t) => (
                        <TaskRow key={t.id} task={t} onToggleStatus={handleToggleTaskStatus} onDelete={handleDeleteTask} />
                      ))}
                  </div>
                )}
                <TaskQuickAddForm
                  defaultAssignee={session.displayName}
                  users={users}
                  onAdd={(data) => handleAddTask(selectedProject.id, data)}
                />
              </div>
            )}

            {activeTab === 'planning' && (
              <div>
                <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                  <h1 className="font-display text-2xl">Planning</h1>
                  <div className="flex gap-1" style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '9px', padding: '3px' }}>
                    <button
                      className="btn-secondary"
                      style={{ border: 'none', background: planningView === 'calendar' ? 'var(--pitch-tint)' : 'transparent', color: planningView === 'calendar' ? 'var(--pitch-dark)' : 'var(--ink-light)' }}
                      onClick={() => setPlanningView('calendar')}
                    >
                      <Calendar size={14} /> Calendrier
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ border: 'none', background: planningView === 'liste' ? 'var(--pitch-tint)' : 'transparent', color: planningView === 'liste' ? 'var(--pitch-dark)' : 'var(--ink-light)' }}
                      onClick={() => setPlanningView('liste')}
                    >
                      <List size={14} /> Liste
                    </button>
                  </div>
                </div>
                <div className="pitch-divider"></div>
                {planningView === 'calendar' ? (
                  <div>
                    <CalendarView
                      monthDate={calendarMonth}
                      tasksByDate={tasksByDate}
                      getProjectColor={getProjectColor}
                      selectedDay={selectedDay}
                      onSelectDay={(d) => setSelectedDay(d === selectedDay ? null : d)}
                      onPrevMonth={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                      onNextMonth={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                    />
                    {selectedDay && (
                      <div className="mt-5">
                        <h3 className="font-display text-base mb-2">Tâches du {formatDateFR(selectedDay)}</h3>
                        {(tasksByDate[selectedDay] || []).length === 0 ? (
                          <p className="text-sm" style={{ color: 'var(--ink-light)' }}>Aucune tâche ce jour-là.</p>
                        ) : (
                          <div>
                            {tasksByDate[selectedDay].map((t) => (
                              <TaskRow key={t.id} task={t} onToggleStatus={handleToggleTaskStatus} onDelete={handleDeleteTask} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <PlanningList tasks={tasks} getProject={getProject} />
                )}
              </div>
            )}

            {activeTab === 'admin' && session.role === 'admin' && (
              <AdminPanel
                users={users}
                session={session}
                onCreateClick={() => setShowCreateUser(true)}
                onResetClick={(u) => setResetTargetUser(u)}
                onToggleRole={handleToggleRole}
                onDeleteClick={(u) =>
                  setConfirmState({
                    message: `Supprimer le compte de ${u.displayName} ?`,
                    onConfirm: () => {
                      handleDeleteUser(u);
                      setConfirmState(null);
                    },
                  })
                }
              />
            )}

            {(activeTab === 'cycles' || activeTab === 'chat' || activeTab === 'docs') && <StubView {...STUB_CONTENT[activeTab]} />}
          </div>
        )}
      </main>

      {showProjectForm && (
        <ProjectFormModal
          initial={editingProject}
          onSubmit={handleSubmitProjectForm}
          onCancel={() => {
            setShowProjectForm(false);
            setEditingProject(null);
          }}
        />
      )}

      {confirmState && (
        <ConfirmDialog
          title="Confirmer la suppression"
          message={confirmState.message}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal
          onSubmit={handleChangeOwnPassword}
          onCancel={() => {
            setShowChangePassword(false);
            setChangePasswordError('');
          }}
          error={changePasswordError}
          busy={changePasswordBusy}
        />
      )}

      {showCreateUser && (
        <CreateUserModal
          existingUsernames={users.map((u) => u.username.toLowerCase())}
          onSubmit={handleCreateUser}
          onCancel={() => setShowCreateUser(false)}
        />
      )}

      {resetTargetUser && (
        <ResetPasswordModal
          user={resetTargetUser}
          onSubmit={(pw) => handleResetPassword(resetTargetUser, pw)}
          onCancel={() => setResetTargetUser(null)}
        />
      )}

      {credentialsReveal && <CredentialsRevealModal {...credentialsReveal} onClose={() => setCredentialsReveal(null)} />}

      {toast && <div className="toast">{toast.message}</div>}
    </div>
  );
}
