import type { Request, Response, NextFunction } from "express";
import { supabaseService } from "../services/supabase";
import type { User } from "@shared/schema";

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authentication token required" });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const user = await supabaseService.verifyAuthToken(token);

    if (!user) {
      res.status(401).json({ message: "Invalid authentication token" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
}
