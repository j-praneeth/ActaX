import type { Express } from "express";
import { authRoutes } from "./auth.routes";
import { meetingRoutes } from "./meeting.routes";
import { integrationRoutes } from "./integration.routes";
import { webhookRoutes } from "./webhook.routes";
import { analyticsRoutes } from "./analytics.routes";

export function registerRoutes(app: Express): void {
  // Ensure all API routes return JSON
  app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  // Register route modules
  app.use('/api/auth', authRoutes);
  app.use('/api/meetings', meetingRoutes);
  app.use('/api/integrations', integrationRoutes);
  app.use('/api/webhooks', webhookRoutes);
  app.use('/api/analytics', analyticsRoutes);
}
