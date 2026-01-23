const express = require('express');
const router = express.Router();

// Simple in-memory stores for invites and teams (for testing only)
const invites = [];
const teams = [];
let inviteId = 1;
let teamId = 1;

// Middleware: require admin - simple check for demo (token should be validated in real app)
function requireAdmin(req, res, next) {
  // In production, validate JWT. For test, allow if header Authorization present or query param code.
  const auth = req.headers.authorization || '';
  const code = req.query.code;
  if (!auth && code !== 'ADMIN_SECRET_2026') {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

// Get invites
router.get('/invites', requireAdmin, (req, res) => {
  res.json({ invites });
});

// Create invite -> generate code + link
router.post('/invites', requireAdmin, express.json(), (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });
  const code = `INVITE-${Date.now()}-${Math.floor(Math.random()*9000+1000)}`;
  const link = `${req.protocol}://${req.get('host')}/register?invite=${encodeURIComponent(code)}`;
  const inv = { id: inviteId++, email, code, link, status: 'sent', createdAt: new Date().toISOString() };
  invites.push(inv);
  res.json({ invite: inv });
});

// Get teams
router.get('/teams', requireAdmin, (req, res) => {
  res.json({ teams });
});

// Create team
router.post('/teams', requireAdmin, express.json(), (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const t = { id: teamId++, name, members: [], createdAt: new Date().toISOString() };
  teams.push(t);
  res.json({ team: t });
});

module.exports = router;
