const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

router.get('/login', (req, res) => res.render('auth/login', { errors: [], form: {} }));

router.post('/login', (req, res) => {
  const { email = '', password = '' } = req.body;
  const errors = [];
  if (!email.trim() || !password) errors.push('Email and password are required.');
  else {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
    if (!user || !bcrypt.compareSync(password, user.password_hash)) errors.push('Invalid email or password.');
    else {
      return req.session.regenerate(() => {
        req.session.user = { id: user.id, name: user.full_name, email: user.email, role: user.role };
        res.redirect('/dashboard');
      });
    }
  }
  res.status(400).render('auth/login', { errors, form: { email } });
});

router.get('/register', (req, res) => res.render('auth/register', { errors: [], form: {} }));

router.post('/register', (req, res) => {
  const { full_name = '', email = '', password = '', role = 'student' } = req.body;
  const errors = [];
  if (full_name.trim().length < 2) errors.push('Full name must be at least 2 characters.');
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.push('Enter a valid email address.');
  if (password.length < 8) errors.push('Password must be at least 8 characters.');
  if (!['student', 'faculty'].includes(role)) errors.push('Invalid role.'); // nobody can self-register as admin
  if (!errors.length && db.prepare('SELECT 1 FROM users WHERE email=?').get(email.toLowerCase()))
    errors.push('That email is already registered.');

  if (errors.length) return res.status(400).render('auth/register', { errors, form: { full_name, email, role } });

  db.prepare('INSERT INTO users (full_name,email,password_hash,role) VALUES (?,?,?,?)')
    .run(full_name.trim(), email.toLowerCase(), bcrypt.hashSync(password, 10), role);
  req.session.flash = 'Account created. Please log in.';
  res.redirect('/login');
});

router.post('/logout', (req, res) => req.session.destroy(() => res.redirect('/login')));

module.exports = router;