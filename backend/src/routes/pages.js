const express = require('express');
const pages = require('../data/pages.json');

const router = express.Router();

router.get('/:slug', (req, res) => {
  const slug = req.params.slug;
  const p = (pages )[slug];
  if (!p) return res.status(404).json({ error: 'Page not found' });
  res.json(p);
});

module.exports = router;
