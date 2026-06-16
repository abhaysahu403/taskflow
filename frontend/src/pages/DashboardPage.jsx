import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          {label}
        </p>
        <p style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 800, marginTop: 4, lineHeight: 1 }}>
          {value ?? <span className="spinner" />}
        </p>
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}22`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>{icon}</div>
    </div>
    {sub && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{sub}</p>}
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          api.get('/tasks/stats/summary'),
          api.get('/tasks?limit=5'),
        ]);
        setStats(statsRes.data.data);
        setRecentTasks(tasksRes.data.data?.slice(0, 5) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1100 }}>
      {/* Hero greeting */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '28px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -20, top: -20,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)',
        }} />
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
            {greeting}, {user?.name?.split(' ')[0]} {user?.avatar}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Here's what's happening with your workspace today.
          </p>
        </div>
        <Link to="/tasks" className="btn btn-primary" style={{ flexShrink: 0 }}>
          + New Task
        </Link>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard label="Total Tasks" value={stats?.total ?? '—'} icon="✓" color="var(--accent)" sub="All time" />
        <StatCard label="In Progress" value={stats?.in_progress ?? '—'} icon="⟳" color="var(--amber)" sub="Active now" />
        <StatCard label="Completed" value={stats?.done ?? '—'} icon="★" color="var(--green)" sub="Well done!" />
        <StatCard label="High Priority" value={stats?.high_priority ?? '—'} icon="⚑" color="var(--red)" sub="Needs attention" />
      </div>

      {/* Progress bar */}
      {stats && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Overall Progress</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {stats.done} / {stats.total} tasks done
            </span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-overlay)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4,
              background: 'linear-gradient(90deg, var(--accent), var(--green))',
              width: stats.total > 0 ? `${(stats.done / stats.total) * 100}%` : '0%',
              transition: 'width 0.8s ease',
            }} />
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
            {[
              { label: 'To Do', val: stats.todo, color: 'var(--text-muted)' },
              { label: 'In Progress', val: stats.in_progress, color: 'var(--amber)' },
              { label: 'Done', val: stats.done, color: 'var(--green)' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}: <strong>{item.val}</strong></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15 }}>Recent Tasks</h3>
          <Link to="/tasks" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>View all →</Link>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 30 }}><span className="spinner" /></div>
        ) : recentTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p className="empty-title">No tasks yet</p>
            <p className="empty-sub">Create your first task to get started</p>
            <Link to="/tasks" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>+ Create Task</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentTasks.map(task => (
              <div key={task.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', background: 'var(--bg-overlay)',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: task.priority === 'high' ? 'var(--red)' : task.priority === 'medium' ? 'var(--amber)' : 'var(--green)',
                }} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500,
                  textDecoration: task.status === 'done' ? 'line-through' : 'none',
                  color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)',
                }}>{task.title}</span>
                <span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {[
          { to: '/tasks', icon: '✓', title: 'Manage Tasks', sub: 'Create, update, complete tasks', color: 'var(--accent)' },
          { to: '/products', icon: '◈', title: 'Products', sub: 'Manage your product catalog', color: '#a855f7' },
          { to: '/users', icon: '◎', title: 'Team Members', sub: 'View your team roster', color: 'var(--blue)' },
        ].map(item => (
          <Link key={item.to} to={item.to} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '20px 24px',
            display: 'flex', flexDirection: 'column', gap: 8,
            transition: 'all 0.2s', textDecoration: 'none',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `${item.color}20`, color: item.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>{item.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{item.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.sub}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
