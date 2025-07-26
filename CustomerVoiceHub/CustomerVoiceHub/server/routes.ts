import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertStoreSchema, insertFeedbackSchema } from "@shared/schema";
import QRCode from "qrcode";
import multer from "multer";
import { z } from "zod";
import path from "path";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Store routes
  app.post('/api/stores', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const storeData = insertStoreSchema.parse({
        ...req.body,
        ownerId: userId,
      });

      const store = await storage.createStore(storeData);
      
      // Generate QR code
      const qrCodeUrl = `${req.protocol}://${req.get('host')}/feedback/${store.id}`;
      const qrCode = await QRCode.toDataURL(qrCodeUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#6C5CE7',
          light: '#FFFFFF'
        }
      });

      // Update store with QR code
      const updatedStore = await storage.updateStore(store.id, { qrCode });
      
      res.json(updatedStore);
    } catch (error) {
      console.error("Error creating store:", error);
      res.status(400).json({ message: "Failed to create store" });
    }
  });

  app.get('/api/stores', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stores = await storage.getStoresByOwner(userId);
      res.json(stores);
    } catch (error) {
      console.error("Error fetching stores:", error);
      res.status(500).json({ message: "Failed to fetch stores" });
    }
  });

  // Demo store endpoint for showcasing features
  app.get('/api/stores/demo', async (req, res) => {
    try {
      // Return a demo store object for demonstration purposes
      const demoStore = {
        id: 'demo',
        name: 'Demo Coffee Shop',
        description: 'Experience our AI-powered feedback collection system',
        location: 'Demo Location',
        ownerId: 'demo',
        qrCode: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      res.json(demoStore);
    } catch (error) {
      console.error("Error fetching demo store:", error);
      res.status(500).json({ message: "Failed to fetch demo store" });
    }
  });

  app.get('/api/stores/:id', async (req, res) => {
    try {
      const storeId = parseInt(req.params.id);
      const store = await storage.getStore(storeId);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      res.json(store);
    } catch (error) {
      console.error("Error fetching store:", error);
      res.status(500).json({ message: "Failed to fetch store" });
    }
  });

  app.put('/api/stores/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const storeId = parseInt(req.params.id);
      const updates = insertStoreSchema.partial().parse(req.body);
      
      // Verify ownership
      const store = await storage.getStore(storeId);
      if (!store || store.ownerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedStore = await storage.updateStore(storeId, updates);
      res.json(updatedStore);
    } catch (error) {
      console.error("Error updating store:", error);
      res.status(400).json({ message: "Failed to update store" });
    }
  });

  app.delete('/api/stores/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const storeId = parseInt(req.params.id);
      
      // Verify ownership
      const store = await storage.getStore(storeId);
      if (!store || store.ownerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteStore(storeId);
      res.json({ message: "Store deleted successfully" });
    } catch (error) {
      console.error("Error deleting store:", error);
      res.status(500).json({ message: "Failed to delete store" });
    }
  });

  // Feedback routes
  app.post('/api/feedback', upload.single('media'), async (req, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse({
        storeId: parseInt(req.body.storeId),
        customerEmail: req.body.customerEmail || null,
        type: req.body.type,
        rating: parseInt(req.body.rating),
        message: req.body.message || null,
        mediaUrl: req.file ? `/uploads/${req.file.filename}` : null,
        status: 'pending',
      });

      const feedback = await storage.createFeedback(feedbackData);

      // Send to n8n webhook
      try {
        const webhookUrl = process.env.N8N_WEBHOOK_URL || process.env.WEBHOOK_URL || "https://webhook.site/test";
        const webhookData = {
          feedbackId: feedback.id,
          storeId: feedback.storeId,
          type: feedback.type,
          rating: feedback.rating,
          message: feedback.message,
          mediaUrl: feedback.mediaUrl,
          customerEmail: feedback.customerEmail,
          timestamp: feedback.submittedAt,
        };

        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData),
        });

        // Update status to processing
        await storage.updateFeedbackStatus(feedback.id, 'processing');
      } catch (webhookError) {
        console.error("Error sending to webhook:", webhookError);
        // Don't fail the request if webhook fails
      }

      res.json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(400).json({ message: "Failed to create feedback" });
    }
  });

  app.get('/api/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const feedback = await storage.getFeedbackByOwner(userId, limit, offset);
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.get('/api/feedback/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getFeedbackStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching feedback stats:", error);
      res.status(500).json({ message: "Failed to fetch feedback stats" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
