import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { nanoid } from "nanoid";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Simplified Vite setup for development
  // In a real implementation, you would use Vite's dev server
  console.log("Vite development server setup (simplified)");
  
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Skip API routes - they should be handled by the API middleware
    if (url.startsWith('/api')) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // Serve the index.html file
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist (but not for API routes)
  app.use("*", (req, res) => {
    // Skip API routes - they should be handled by the API middleware
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({
        error: 'Not Found',
        message: `API endpoint ${req.method} ${req.originalUrl} not found`,
        path: req.originalUrl
      });
    }
    
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
