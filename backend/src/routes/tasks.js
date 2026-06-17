const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/tasks/stats/summary - MUST be before /:id routes
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status='todo' THEN 1 ELSE 0 END) as todo,
        SUM(CASE WHEN status='in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) as done,
        SUM(CASE WHEN priority='high' THEN 1 ELSE 0 END) as \`high_priority\`
      FROM tasks WHERE created_by = ? OR assigned_to = ?
    `, [req.user.id, req.user.id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/tasks
router.get('/', authMiddleware, async (req, res) => {
  const { status, priority, assigned_to } = req.query;
  try {
    let query = `
      SELECT t.*, 
        u1.name as creator_name, u1.avatar as creator_avatar,
        u2.name as assignee_name, u2.avatar as assignee_avatar
      FROM tasks t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE (t.created_by = ? OR t.assigned_to = ?)
    `;
    const params = [req.user.id, req.user.id];
    if (status) { query += ' AND t.status = ?'; params.push(status); }
    if (priority) { query += ' AND t.priority = ?'; params.push(priority); }
    if (assigned_to) { query += ' AND t.assigned_to = ?'; params.push(assigned_to); }
    query += ' ORDER BY t.created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Tasks GET error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/tasks
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, status, priority, due_date, assigned_to } = req.body;
  if (!title) return res.status(400).json({ success: false, message: 'Title is required' });
  try {
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO tasks (id, title, description, status, priority, due_date, assigned_to, created_by) VALUES (?,?,?,?,?,?,?,?)',
      [id, title, description||'', status||'todo', priority||'medium', due_date||null, assigned_to||req.user.id, req.user.id]
    );
    res.status(201).json({ success: true, message: 'Task created', id });
  } catch (err) {
    console.error('Task POST error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, description, status, priority, due_date, assigned_to } = req.body;
  try {
    const [existing] = await pool.execute('SELECT created_by FROM tasks WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Task not found' });
    await pool.execute(
      'UPDATE tasks SET title=?, description=?, status=?, priority=?, due_date=?, assigned_to=? WHERE id=?',
      [title, description, status, priority, due_date||null, assigned_to, req.params.id]
    );
    res.json({ success: true, message: 'Task updated' });
  } catch (err) {
    console.error('Task PUT error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/tasks/:id/status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  if (!['todo','in_progress','done'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  try {
    await pool.execute('UPDATE tasks SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    console.error('Task PATCH status error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [existing] = await pool.execute('SELECT created_by FROM tasks WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Task not found' });
    if (existing[0].created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    await pool.execute('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    console.error('Task DELETE error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
