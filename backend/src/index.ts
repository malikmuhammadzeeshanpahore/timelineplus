import express from 'express';
import session from 'express-session';
import passport from './auth/passport';
import oauthRoutes from './routes/oauth';
import paymentRoutes from './routes/payments';
import authRoutes from './routes/auth';
import tasksRoutes from './routes/tasks';
import adminRoutes from './routes/admin';
import notificationsRoutes from './routes/notifications';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PORT } from './config';

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 200, // adjust as needed
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
import linkRoutes from './routes/link';
import userRoutes from './routes/user';
import pagesRoutes from './routes/pages';
app.use('/api/link', linkRoutes);
app.use('/api/user', userRoutes);
app.use('/api/pages', pagesRoutes);

// Serve static test page and frontend
app.use(express.static('public'));

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
