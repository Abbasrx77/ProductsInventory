import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserPrismaService } from '../../prisma/user.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthService {
    private static readonly JWT_SECRET = process.env.JWT_SECRET;
    private static readonly SALT_LENGTH = 32;
    private static readonly KEY_LENGTH = 64;
    private static readonly TOKEN_EXPIRY = '1h';

    static generateSalt(): string {
        return crypto.randomBytes(this.SALT_LENGTH).toString('hex');
    }

    static hashPassword(password: string, salt: string): string {
        return crypto.pbkdf2Sync(
            password,
            salt,
            1000,
            this.KEY_LENGTH,
            'sha512'
        ).toString('hex');
    }

    static generateToken(userId: string): string {
        return jwt.sign({ userId }, this.JWT_SECRET, {
            expiresIn: this.TOKEN_EXPIRY
        });
    }

    static async saveToken(userId: string, token: string): Promise<void> {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        await prisma.activeToken.create({
            data: {
                token,
                userId,
                expiresAt
            }
        });
    }

    static async register(userData: {
        email: string;
        password: string;
        nom: string;
        prenom: string;
    }) {
        const existingUser = await UserPrismaService.getUser(userData.email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const salt = this.generateSalt();
        const hash = this.hashPassword(userData.password, salt);

        const user = await UserPrismaService.createUser({
            email: userData.email,
            nom: userData.nom,
            prenom: userData.prenom,
            hash,
            salt
        });

        const token = this.generateToken(user.id);
        await this.saveToken(user.id, token);

        return {
            user,
            token
        };
    }

    static async login(email: string, password: string) {
        const user = await UserPrismaService.getUser(email);
        if (!user) {
            throw new Error('User not found');
        }

        const hash = this.hashPassword(password, user.salt);
        if (hash !== user.hash) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken(user.id);
        await this.saveToken(user.id, token);

        return {
            user,
            token
        };
    }

    static async verifyToken(token: string): Promise<{ userId: string }> {
        try {
            // Vérifier si le token est actif dans la base de données
            const activeToken = await prisma.activeToken.findUnique({
                where: { token }
            });

            if (!activeToken) {
                throw new Error('Token not found');
            }

            if (activeToken.expiresAt < new Date()) {
                await prisma.activeToken.delete({
                    where: { id: activeToken.id }
                });
                throw new Error('Token expired');
            }

            return jwt.verify(token, this.JWT_SECRET) as { userId: string };
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    static async logout(token: string): Promise<void> {
        await prisma.activeToken.delete({
            where: { token }
        });
    }

    static async cleanupExpiredTokens(): Promise<void> {
        const now = new Date();
        await prisma.activeToken.deleteMany({
            where: {
                expiresAt: {
                    lt: now
                }
            }
        });
    }
}