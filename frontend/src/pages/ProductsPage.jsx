import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

function ProductModal({ product, onClose, onSaved }) {
  const isEdit = !!product?.id;
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || 'General',
    stock: product?.stock || 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.price || isNaN(form.price)) { setError('Valid price is required'); return; }
    setLoading(true); setError('');
    try {
      if (isEdit) await api.put(`/products/${product.id}`, form);
      else await api.post('/products', form);
      onSaved(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally { setLoading(false); }
  };

  const CATEGORIES = ['General', 'Electronics', 'Clothing', 'Food', 'Books', 'Tools', 'Other'];

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? '✏️ Edit Product' : '+ New Product'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input value={form.name} onChange={set('name')} placeholder="e.g. Wireless Keyboard" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea value={form.description} onChange={set('description')} placeholder="Product description..." rows={3} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={set('price')} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Stock</label>
              <input type="number" min="0" value={form.stock} onChange={set('stock')} placeholder="0" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select value={form.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving...</> : isEdit ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      const { data } = await api.get('/products', { params });
      setProducts(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, category]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(p => p.filter(x => x.id !== id));
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const stockColor = (stock) => stock === 0 ? 'var(--red)' : stock < 10 ? 'var(--amber)' : 'var(--green)';
  const stockLabel = (stock) => stock === 0 ? 'Out of Stock' : stock < 10 ? 'Low Stock' : 'In Stock';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>Products</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{products.length} items in catalog</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200 }} />
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: 140 }}>
            <option value="">All Categories</option>
            {['General','Electronics','Clothing','Food','Books','Tools','Other'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => { setEditProduct(null); setShowModal(true); }}>+ Add Product</button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" /></div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◈</div>
          <p className="empty-title">No products found</p>
          <p className="empty-sub">Add your first product to get started</p>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => setShowModal(true)}>+ Add Product</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {products.map(p => (
            <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Category chip */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px',
                  borderRadius: 20, background: 'var(--accent-soft)', color: 'var(--accent)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>{p.category}</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px',
                  borderRadius: 20,
                  background: p.stock === 0 ? 'var(--red-soft)' : p.stock < 10 ? 'var(--amber-soft)' : 'var(--green-soft)',
                  color: stockColor(p.stock),
                }}>{stockLabel(p.stock)}</span>
              </div>

              <div>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{p.name}</h3>
                {p.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {p.description.slice(0, 80)}{p.description.length > 80 ? '...' : ''}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>
                    ₹{parseFloat(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Stock: {p.stock}</p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditProduct(p); setShowModal(true); }}>✏</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>✕</button>
                </div>
              </div>

              {p.creator_name && (
                <p style={{ fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                  Added by {p.creator_name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSaved={load}
        />
      )}
    </div>
  );
}
