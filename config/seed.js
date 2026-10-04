require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

const users = [
  ['Admin User', 'admin@campus.test', 'Admin123!', 'admin'],
  ['Carlo Custodian', 'custodian@campus.test', 'Custodian123!', 'custodian'],
  ['Faith Faculty', 'faculty@campus.test', 'Faculty123!', 'faculty'],
  ['Sam Student', 'student@campus.test', 'Student123!', 'student'],
];
const insUser = db.prepare('INSERT OR IGNORE INTO users (full_name,email,password_hash,role) VALUES (?,?,?,?)');
users.forEach(([n, e, p, r]) => insUser.run(n, e, bcrypt.hashSync(p, 10), r));

const items = [
  ['Projector', 'AV', 'PRJ-001', 3],
  ['Laptop', 'Computing', 'LAP-001', 5],
  ['HDMI Cable', 'Accessories', 'HDM-001', 10],
  ['Digital Camera', 'AV', 'CAM-001', 2],
  ['Extension Cord', 'Accessories', 'EXT-001', 6],
];
const insEq = db.prepare('INSERT OR IGNORE INTO equipment (name,category,asset_tag,quantity) VALUES (?,?,?,?)');
items.forEach((i) => insEq.run(...i));

console.log('Seed complete.');