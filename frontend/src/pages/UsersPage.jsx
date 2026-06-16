import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/users')
      .then(r => setUsers(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (id === currentUser.id) { alert("You can't delete yourself!"); return; }
    if (!confirm('Remove this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(u => u.filter(x => x.id !== id));
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const filtered = users.filter(u =>
    search ? u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) : true
  );

  const roleColor = role => role === 'admin' ? { bg: 'var(--accent-soft)', color: 'var(--accent)' }
    : { bg: 'var(--bg-overlay)', color: 'var(--text-secondary)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>Team Members</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{users.length} members</p>
        </div>
        <input
          placeholder="🔍 Search team..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 220 }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◎</div>
          <p className="empty-title">No users found</p>
          <p className="empty-sub">Register new accounts to see them here</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(u => {
            const role = roleColor(u.role);
            const isMe = u.id === currentUser.id;
            return (
              <div key={u.id} className="card" style={{
                display: 'flex', flexDirection: 'column', gap: 16,
                border: isMe ? '1px solid var(--accent)' : '1px solid var(--border)',
                position: 'relative',
              }}>
                {isMe && (
                  <span style={{
                    position: 'absolute', top: 12, right: 12,
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: 'var(--accent)',
                    background: 'var(--accent-soft)', padding: '2px 8px', borderRadius: 20,
                  }}>You</span>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'var(--bg-overlay)', border: isMe ? '2px solid var(--accent)' : '2px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, flexShrink: 0,
                  }}>{u.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{u.name}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.email}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                    background: role.bg, color: role.color,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{u.role}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Joined {new Date(u.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {currentUser.role === 'admin' && !isMe && (
                  <button className="btn btn-danger btn-sm" style={{ alignSelf: 'flex-start' }}
                    onClick={() => handleDelete(u.id)}>
                    Remove Member
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
