const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const passport = require('./auth/passport');
const oauthRoutes = require('./routes/oauth');
const paymentRoutes = require('./routes/payments');
const authRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/tasks');
const adminRoutes = require('./routes/admin');
const notificationsRoutes = require('./routes/notifications');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PORT } = require('./config');

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 200, // adjust 
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat replace',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', oauthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/wallet', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationsRoutes);
const linkRoutes = require('./routes/link');
const userRoutes = require('./routes/user');
const pagesRoutes = require('./routes/pages');
app.use('/api/link', linkRoutes);
app.use('/api/user', userRoutes);
const accountRoutes = require('./routes/account');
app.use('/api/account', accountRoutes);
app.use('/api/pages', pagesRoutes);
// Campaigns route
const campaignsRoutes = require('./routes/campaigns');
app.use('/api/campaigns', campaignsRoutes);
// Admin-panel routes (separate admin UI endpoints)
const adminPanelRoutes = require('./routes/admin-panel');
app.use('/api/admin-panel', adminPanelRoutes);

// Ensure unmatched /api/* requests return JSON 404 instead of falling through to HTML
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'not found' });
});

// Serve built frontend when available (dist/) otherwise fallback to public/
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static('dist'));
  // fallback to index for client-side routes
  app.get('/*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.use(express.static('public'));
}

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
