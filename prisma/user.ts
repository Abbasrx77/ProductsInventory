import {PrismaClient, User} from "@prisma/client";
const prisma = new PrismaClient()

export type PaginatedUsers = {
    total: number;
    limit: number;
    skip: number;
    data: User[];
}

export class UserPrismaService {

    static async getAllUsers($limit: number, $skip: number, query?: any): Promise<PaginatedUsers> {
        const limit = isNaN(Number($limit)) ? 20 : Number($limit);
        const skip = isNaN(Number($skip)) ? 0 : Number($skip);

        const total = await prisma.user.count();
        const users = await prisma.user.findMany({
            skip: skip,
            take: limit,
            where: {
                OR: query.length > 0 ? query : undefined,
            },
        });

        return {
            total: total,
            limit: limit,
            skip: skip,
            data: users
        };
    }

    static async getUser(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email }
        });
    }

    static async getUserById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id }
        });
    }

    static async createUser(user: Omit<User, 'id'>): Promise<User> {
        return prisma.user.create({
            data: user
        });
    }

    static async updateUser(id: string, user: Partial<User>): Promise<User> {
        return prisma.user.update({
            where: { id },
            data: user
        });
    }

    static async deleteUser(id: string): Promise<void> {
        await prisma.user.delete({
            where: { id }
        });
    }
}
async function main() {

}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e);
        prisma.$disconnect()
    })