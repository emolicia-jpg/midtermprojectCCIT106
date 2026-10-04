require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./config/db');
const { requireLogin, requireRole } = require('./middleware/auth');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 2 }, // 2 hours
}));

// make user + flash message available in every view
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

app.get('/', (req, res) => res.redirect(req.session.user ? '/dashboard' : '/login'));
app.get('/dashboard', requireLogin, (req, res) => {
  const u = req.session.user;
  const notes = db.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 5').all(u.id);
  res.render('dashboard', { notes });
});

app.use('/', require('./routes/auth'));
app.use('/equipment', requireLogin, require('./routes/equipment'));
app.use('/requests', requireRole('student', 'faculty'), require('./routes/requests'));
app.use('/manage', requireRole('custodian', 'admin'), require('./routes/manage'));
app.use('/admin', requireRole('admin'), require('./routes/admin'));

app.use((req, res) => res.status(404).render('404'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));