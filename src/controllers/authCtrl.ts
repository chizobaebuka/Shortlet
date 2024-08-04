import { ILoginRequest, ISignupRequest, IUser } from "../interfaces/user.interface";
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { signUpUserSchema } from "../validation/user.validation";
import User from "../db/models/user";
import { generateToken } from "../utils/helpers";


export const signupUser = async (req: Request<{}, {}, ISignupRequest>, res: Response) => {
    try {
        // Validate the request body using Zod schema
        const validation = signUpUserSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({ error: validation.error.errors });
        }

        // Destructure validated data
        const { username, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'> = {
            username,
            email,
            password: hashedPassword,
            role: role as 'admin' | 'user'
        };

        const newUser = await User.create(user);
        res.status(201).json(newUser);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const loginUser = async (req: Request<{}, {}, ILoginRequest>, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken({ id: user.id, email: user.email });

        res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    } catch (err: any) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error: any) {
        console.error('Error getting all users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
export const logoutUser = async (req: Request, res: Response) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}