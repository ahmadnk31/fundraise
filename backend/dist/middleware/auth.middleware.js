import jwt from 'jsonwebtoken';
import { db, users } from '../db/index.js';
import { eq } from 'drizzle-orm';
export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is not defined');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error',
            });
        }
        // Verify token
        const decoded = jwt.verify(token, secret);
        // Get user from database
        const [user] = await db
            .select({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            isVerified: users.isVerified,
        })
            .from(users)
            .where(eq(users.id, decoded.userId))
            .limit(1);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.',
            });
        }
        // Add user to request object
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.',
            });
        }
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: 'Token expired.',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Authentication error',
        });
    }
};
// Optional auth middleware - doesn't fail if no token
export const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return next(); // Continue without user
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return next(); // Continue without user
        }
        const decoded = jwt.verify(token, secret);
        const [user] = await db
            .select({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            isVerified: users.isVerified,
        })
            .from(users)
            .where(eq(users.id, decoded.userId))
            .limit(1);
        if (user) {
            req.user = user;
        }
        next();
    }
    catch (error) {
        // Ignore errors and continue without user
        next();
    }
};
// Check if user is verified
export const requireVerifiedUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
    }
    if (!req.user.isVerified) {
        return res.status(403).json({
            success: false,
            message: 'Email verification required',
        });
    }
    next();
};
//# sourceMappingURL=auth.middleware.js.map