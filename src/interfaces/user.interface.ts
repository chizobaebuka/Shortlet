export interface ICore {
    id: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUser extends ICore {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'user'; 
}

export enum RoleEnum {
    ADMIN = 'admin',
    USER = 'user',
}

export interface ISignupRequest {
    username: string;
    email: string;
    password: string;
    role?: 'admin' | 'user'; 
}

export interface ILoginRequest {
    email: string;
    password: string;
}
