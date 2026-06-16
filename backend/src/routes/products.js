const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const { getCache, setCache, delCache } = require('../config/redis');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/products
router.get('/', authMiddleware, async (req, res) => {
  const { category, search, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    let query = `
      SELECT p.*, u.name as creator_name FROM products p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    if (category) { query += ' AND p.category = ?'; params.push(category); }
    if (search)   { query += ' AND p.name LIKE ?'; params.push(`%${search}%`); }
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await pool.execute(query, params);
    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM products');

    res.json({ success: true, data: rows, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/products/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT p.*, u.name as creator_name FROM products p LEFT JOIN users u ON p.created_by = u.id WHERE p.id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/products
router.post('/', authMiddleware, async (req, res) => {
  const { name, description, price, category, stock } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ success: false, message: 'Name and price are required' });
  }
  try {
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO products (id, name, description, price, category, stock, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, description || '', parseFloat(price), category || 'General', parseInt(stock) || 0, req.user.id]
    );
    await delCache('products:all');
    res.status(201).json({ success: true, message: 'Product created', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/products/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, description, price, category, stock } = req.body;
  try {
    const [existing] = await pool.execute('SELECT created_by FROM products WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Product not found' });
    if (existing[0].created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    await pool.execute(
      'UPDATE products SET name=?, description=?, price=?, category=?, stock=? WHERE id=?',
      [name, description, parseFloat(price), category, parseInt(stock), req.params.id]
    );
    res.json({ success: true, message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [existing] = await pool.execute('SELECT created_by FROM products WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Product not found' });
    if (existing[0].created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
