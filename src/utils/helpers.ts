import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

interface TokenPayload {
    id: number;
    email: string;
    [key: string]: any;
}

export const generateToken = (payload: TokenPayload): string => {
    if (!process.env.JWT_SECRET_KEY) {
        throw new Error('JWT_SECRET_KEY is missing from environment variables');
    }
    if (!process.env.JWT_EXPIRES_IN) {
        throw new Error('JWT_EXPIRES_IN is missing from environment variables');
    }

    const secretKey = process.env.JWT_SECRET_KEY;
    const expiresIn = process.env.JWT_EXPIRES_IN;

    return jwt.sign(payload, secretKey, {
        expiresIn: expiresIn,
    });
};
