const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const { getCache, setCache, delCache } = require('../config/redis');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/users - Get all users (protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cacheKey = 'users:all';
    const cached = await getCache(cacheKey);
    if (cached) return res.json({ success: true, data: cached, fromCache: true });

    const [rows] = await pool.execute(
      'SELECT id, name, email, avatar, role, created_at FROM users ORDER BY created_at DESC'
    );
    await setCache(cacheKey, rows, 120);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/users/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, avatar, role, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/users/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, avatar } = req.body;
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  try {
    await pool.execute('UPDATE users SET name = ?, avatar = ? WHERE id = ?', [name, avatar, req.params.id]);
    await delCache('users:all');
    res.json({ success: true, message: 'User updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  try {
    await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    await delCache('users:all');
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
