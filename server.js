const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'money_db',
  password: 'chokit46', 
  port: 5432,
});

pool.connect((err) => {
  if (err) console.error('ошибка подключения к БД:', err);
  else console.log('подключено к PostgreSQL (money_db)');
});


app.get('/api/transactions', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id обязателен' });

  try {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC',
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  const { user_id, type, amount, category, date, comment } = req.body;

  if (!user_id || !type || !amount || !category || !date) {
    return res.status(400).json({ error: 'Заполните все обязательные поля' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO transactions (user_id, type, amount, category, date, comment) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, type, amount, category, date, comment || '']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
    res.json({ message: 'транзакция удалена' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/summary', async (req, res) => {
  const { user_id } = req.query;

  try {
    const result = await pool.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' AND date = CURRENT_DATE THEN amount ELSE 0 END), 0) as today_income,
        COALESCE(SUM(CASE WHEN type = 'expense' AND date = CURRENT_DATE THEN amount ELSE 0 END), 0) as today_expense,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as balance
      FROM transactions WHERE user_id = $1`,
      [user_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/categories', async (req, res) => {
  const { user_id } = req.query;

  try {
    const result = await pool.query(
      `SELECT category, SUM(amount) as total
       FROM transactions
       WHERE user_id = $1 AND type = 'expense'
       GROUP BY category
       ORDER BY total DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`сервер запущен на http://localhost:${PORT}`);
});