import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Middleware for JWT Verification
 * Currently supports:
 * 1. Bearer Token in Authorization header
 * 2. x-user-id header (Temporary fallback for internal development)
 */
export const verifyJwt = (req: any, res: Response, next: NextFunction) => {
  // 1. Check for x-user-id header (Temp solution)
  const userIdHeader = req.headers["x-user-id"];
  if (userIdHeader) {
    req.user = { 
      id: userIdHeader,
      role: req.headers["x-user-role"] || "USER" 
    };
    return next();
  }

  // 2. Check for Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Accès non autorisé. Token manquant." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET || "fallback_secret");
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(401).json({ message: "Session expirée ou invalide." });
  }
};
