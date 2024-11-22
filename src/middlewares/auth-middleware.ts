import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth-service.js';
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: { userId: string };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        try {
            const decoded = await AuthService.verifyToken(token);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: error.message });
        }
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};