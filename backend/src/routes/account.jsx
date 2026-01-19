const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { jwtMiddleware } = require('../middleware/auth');
const router = express.Router();
const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'withdrawal-details.json');

async function readStore(){
  try{ const raw = await fs.readFile(DATA_FILE, 'utf8'); return JSON.parse(raw||'{}'); }catch(err){ if(err.code==='ENOENT') return {}; throw err; }
}
async function writeStore(obj){
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(obj, null, 2), 'utf8');
}

// get withdrawal details for current user
router.get('/withdrawal-details', jwtMiddleware, async (req, res)=>{
  const uid = Number(req.user.id);
  const store = await readStore();
  res.json({ details: store[uid] || null });
});

// save withdrawal details for current user
router.post('/withdrawal-details', jwtMiddleware, async (req, res)=>{
  const uid = Number(req.user.id);
  const { accountHolder, accountType, accountNumber } = req.body;
  if(!accountHolder || !accountType || !accountNumber) return res.status(400).send('Missing fields');
  const store = await readStore();
  store[uid] = { accountHolder, accountType, accountNumber, updatedAt: new Date().toISOString() };
  await writeStore(store);
  res.json({ success: true, details: store[uid] });
});

module.exports = router;
