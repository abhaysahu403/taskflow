import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const STATUSES = ['todo', 'in_progress', 'done'];
const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };
const STATUS_COLORS = { todo: 'var(--text-muted)', in_progress: 'var(--amber)', done: 'var(--green)' };

function TaskModal({ task, onClose, onSaved }) {
  const isEdit = !!task?.id;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setLoading(true); setError('');
    try {
      if (isEdit) {
        await api.put(`/tasks/${task.id}`, form);
      } else {
        await api.post('/tasks', form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? '✏️ Edit Task' : '+ New Task'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input value={form.title} onChange={set('title')} placeholder="What needs to be done?" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea value={form.description} onChange={set('description')} placeholder="Add details..." rows={3}
              style={{ resize: 'vertical' }} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select value={form.status} onChange={set('status')}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select value={form.priority} onChange={set('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input type="date" value={form.due_date} onChange={set('due_date')} />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving...</> : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const [deleting, setDeleting] = useState(false);
  const priorityDot = { low: 'var(--green)', medium: 'var(--amber)', high: 'var(--red)' };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    setDeleting(true);
    try { await onDelete(task.id); } finally { setDeleting(false); }
  };

  const cycleStatus = () => {
    const next = { todo: 'in_progress', in_progress: 'done', done: 'todo' };
    onStatusChange(task.id, next[task.status]);
  };

  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'all 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
          background: priorityDot[task.priority],
          boxShadow: `0 0 6px ${priorityDot[task.priority]}`,
        }} />
        <p style={{
          flex: 1, fontWeight: 600, fontSize: 14, lineHeight: 1.4,
          textDecoration: task.status === 'done' ? 'line-through' : 'none',
          color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)',
        }}>{task.title}</p>
      </div>
      {task.description && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', paddingLeft: 16, lineHeight: 1.5 }}>
          {task.description.slice(0, 80)}{task.description.length > 80 ? '...' : ''}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 16 }}>
        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
        {task.due_date && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            📅 {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, paddingLeft: 16, marginTop: 2 }}>
        <button onClick={cycleStatus} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
          ⟳ Move
        </button>
        <button onClick={() => onEdit(task)} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
          ✏ Edit
        </button>
        <button onClick={handleDelete} className="btn btn-danger btn-sm" style={{ fontSize: 11 }} disabled={deleting}>
          {deleting ? '...' : '✕'}
        </button>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState({ priority: '', search: '' });

  const loadTasks = useCallback(async () => {
    try {
      const params = {};
      if (filter.priority) params.priority = filter.priority;
      const { data } = await api.get('/tasks', { params });
      setTasks(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filter.priority]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleDelete = async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks(t => t.filter(x => x.id !== id));
  };

  const handleStatusChange = async (id, status) => {
    await api.patch(`/tasks/${id}/status`, { status });
    setTasks(t => t.map(x => x.id === id ? { ...x, status } : x));
  };

  const filteredTasks = tasks.filter(t =>
    filter.search ? t.title.toLowerCase().includes(filter.search.toLowerCase()) : true
  );

  const byStatus = STATUSES.reduce((acc, s) => {
    acc[s] = filteredTasks.filter(t => t.status === s);
    return acc;
  }, {});

  const totalByStatus = STATUSES.reduce((acc, s) => { acc[s] = tasks.filter(t => t.status === s).length; return acc; }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>Task Board</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
            {tasks.length} total · {totalByStatus.done} completed
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            placeholder="🔍 Search tasks..."
            value={filter.search}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            style={{ width: 200 }}
          />
          <select value={filter.priority} onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}
            style={{ width: 130 }}>
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button className="btn btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}>
            + New Task
          </button>
        </div>
      </div>

      {/* Kanban board */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'start' }}>
          {STATUSES.map(status => (
            <div key={status} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            }}>
              {/* Column header */}
              <div style={{
                padding: '14px 16px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--bg-elevated)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: STATUS_COLORS[status],
                  }} />
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{STATUS_LABELS[status]}</span>
                </div>
                <span style={{
                  padding: '2px 8px', borderRadius: 20,
                  background: 'var(--bg-overlay)',
                  fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                }}>{byStatus[status].length}</span>
              </div>
              {/* Tasks */}
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 100 }}>
                {byStatus[status].length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                    No tasks here
                  </div>
                ) : byStatus[status].map(task => (
                  <TaskCard
                    key={task.id} task={task}
                    onEdit={t => { setEditTask(t); setShowModal(true); }}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <TaskModal
          task={editTask}
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSaved={loadTasks}
        />
      )}
    </div>
  );
}
