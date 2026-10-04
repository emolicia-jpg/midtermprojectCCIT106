const router = require('express').Router();
const db = require('../config/db');

function availableQty(equipmentId, startAt, dueAt) {
  const eq = db.prepare('SELECT quantity FROM equipment WHERE id=? AND is_active=1').get(equipmentId);
  if (!eq) return 0;
  const used = db.prepare(`
    SELECT COALESCE(SUM(quantity),0) AS n FROM requests
    WHERE equipment_id=? AND status IN ('Approved','Borrowed')
      AND start_at < ? AND due_at > ?`).get(equipmentId, dueAt, startAt).n;
  return eq.quantity - used;
}

router.get('/new', (req, res) => {
  const equipment = db.prepare('SELECT * FROM equipment WHERE is_active=1 ORDER BY name').all();
  res.render('requests/new', { equipment, errors: [], form: { equipment_id: req.query.equipment_id || '' } });
});

router.post('/new', (req, res) => {
  const { equipment_id, quantity, purpose = '', start_at, due_at } = req.body;
  const qty = parseInt(quantity, 10);
  const errors = [];

  if (!equipment_id) errors.push('Select an equipment item.');
  if (!Number.isInteger(qty) || qty < 1) errors.push('Quantity must be a whole number of at least 1.');
  if (purpose.trim().length < 5 || purpose.length > 300) errors.push('Purpose must be 5–300 characters.');
  if (!start_at || !due_at) errors.push('Start and return date/time are required.');
  else if (due_at <= start_at) errors.push('Return date/time must be after the start date/time.');

  if (!errors.length && availableQty(equipment_id, start_at, due_at) < qty)
    errors.push('Not enough units are available for that period.');

  if (errors.length) {
    const equipment = db.prepare('SELECT * FROM equipment WHERE is_active=1 ORDER BY name').all();
    return res.status(400).render('requests/new', { equipment, errors, form: req.body });
  }

  db.prepare(`INSERT INTO requests (user_id,equipment_id,quantity,purpose,start_at,due_at)
              VALUES (?,?,?,?,?,?)`).run(req.session.user.id, equipment_id, qty, purpose.trim(), start_at, due_at);
  req.session.flash = 'Request submitted. Status: Pending.';
  res.redirect('/requests/mine');
});

router.get('/mine', (req, res) => {
  const rows = db.prepare(`SELECT r.*, e.name AS equipment_name FROM requests r
    JOIN equipment e ON e.id=r.equipment_id WHERE r.user_id=? ORDER BY r.id DESC`).all(req.session.user.id);
  res.render('requests/mine', { rows });
});

module.exports = router;