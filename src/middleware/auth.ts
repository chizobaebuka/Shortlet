import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: 'admin' | 'user';
    };
}

// Middleware to authenticate JWT and set req.user
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('Token is missing');
        return res.status(401).json({ error: 'Token is required' });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY as string, (err, user) => {
        if (err) {
            console.error('Token verification failed:', err.message);
            return res.status(403).json({ error: 'Forbidden' });
        }

        req.user = user as { id: number; email: string; role: 'admin' | 'user' };
        next();
    });
};

// Middleware to authorize user role
export const authorizeRole = (roles: ('admin' | 'user')[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user) {
        if (roles.includes(req.user.role)) {
            next();
        } else {
            console.log(`User role ${req.user.role} does not have access`);
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(403);
    }
};
