import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.ts";
import { PaginatedUsers } from "../../prisma/user.ts";
import { asyncWrapper } from "../utils/async-wrapper.ts";
import { UserService } from "../services/user.ts";
import { validationResult } from "express-validator";
import { AuthService } from "../services/auth-service.js";

export const getAllUsers = asyncWrapper(async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    let { $limit, $skip } = req.query;
    let lim: string = `${$limit}`;
    let sk: string = `${$skip}`;
    const limit = parseInt(lim);
    const skip = parseInt(sk);

    const searchConditions = Array.isArray(req.query.$or) ? req.query.$or.map(condition => {
        const field = Object.keys(condition)[0];
        const regex = condition[field].$regex;
        const options = condition[field].$options;
        return {
            [field]: {
                contains: regex,
                mode: options === 'i' ? 'insensitive' : 'sensitive'
            }
        };
    }) : [];
    const users: PaginatedUsers | null = await UserService.getAllUsers(limit, skip, searchConditions);
    if (!users) {
        throw new Error("No users found");
    }
    return res.status(200).json(users);
});

export const getUser = asyncWrapper(async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const email: string = req.params.email;
    const user: User | null = await UserService.getUser(email);
    if (!user) {
        throw new Error("User not found");
    }
    return res.status(200).json(user);
});

export const createUser = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new Error(JSON.stringify(errors.array()));
    }
    const userToCreate = req.body;
    const { user, token } = await AuthService.register(userToCreate);
    return res.status(201).json({ user, token });
});

export const login = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await UserService.getUser(email);
    if (!user) {
        throw new Error("User not found");
    }
    const result = await AuthService.login(email, password);
    if (!result) {
        throw new Error("Invalid login credentials");
    }
    return res.status(200).json(result);
});

export const logout = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        throw new Error("Token required");
    }
    await AuthService.logout(token);
    res.status(200).json({ message: 'Logged out successfully' });
});

export const getUserById = asyncWrapper(async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const userId: string = req.params.id;
    const user: User | null = await UserService.getUserById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    return res.status(200).json(user);
});

export const updateUser = asyncWrapper(async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const userId: string = req.params.id;
    const userData = req.body;
    const updatedUser: User | null = await UserService.updateUser(userId, userData);
    if (!updatedUser) {
        throw new Error("User not found");
    }
    return res.status(200).json(updatedUser);
});

export const deleteUser = asyncWrapper(async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const userId: string = req.params.id;
    const user: User | null = await UserService.getUserById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    await UserService.deleteUser(userId);
    return res.status(204).json({ message: "User deleted successfully" });
});