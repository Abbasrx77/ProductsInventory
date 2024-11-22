import {Produit, PrismaClient} from "@prisma/client";
const prisma = new PrismaClient();

export type PaginatedProduit = {
    total: number;
    limit: number;
    skip: number;
    data: Produit[];
}

export class ProduitPrismaService {

    static async getAllProduit($limit: number, $skip: number, query?: any): Promise<PaginatedProduit> {
        const limit = isNaN(Number($limit)) ? 20 : Number($limit);
        const skip = isNaN(Number($skip)) ? 0 : Number($skip);

        const total = await prisma.produit.count();
        const produits = await prisma.produit.findMany({
            skip: skip,
            take: limit,
            where: {
                OR: query.length > 0 ? query : undefined,
            }
        });

        return {
            total: total,
            limit: limit,
            skip: skip,
            data: produits
        };
    }

    static async createProduit(produit: Omit<Produit, 'id'>): Promise<Produit> {
        return prisma.produit.create({
            data: produit
        });
    }

    static async getProduitById(id: string): Promise<Produit | null> {
        return prisma.produit.findUnique({
            where: {id}
        });
    }
    static async updateProduit(id: string, produit: Partial<Produit>): Promise<Produit> {
        return prisma.produit.update({
            where: {id},
            data: produit
        });
    }
    static async deleteProduit(id: string): Promise<void> {
        await prisma.produit.delete({
            where: {id}
        })
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