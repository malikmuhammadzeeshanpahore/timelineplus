import express from 'express';
import pages from '../data/pages.json';

const router = express.Router();

router.get('/:slug', (req, res) => {
  const slug = req.params.slug;
  const p = (pages as any)[slug];
  if (!p) return res.status(404).json({ error: 'Page not found' });
  res.json(p);
});

export default router;
