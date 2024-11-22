import { Produit } from "../models/produit.js";
import {PaginatedProduit, ProduitPrismaService} from "../../prisma/produit.js";


export class ProduitService {

    static async getProduitById(id: string): Promise<Produit | null> {
        return await ProduitPrismaService.getProduitById(id)
    }

    static async getAllProduit($limit: number, $skip: number, query?: any): Promise<PaginatedProduit | null> {
        return await ProduitPrismaService.getAllProduit($limit, $skip, query)
    }

    static async createProduit(produit: Omit<Produit, 'id'>): Promise<Produit> {
        return await ProduitPrismaService.createProduit(produit)
    }

    static async updateProduit(id: string, produit: Partial<Produit>): Promise<Produit> {
        return await ProduitPrismaService.updateProduit(id, produit)
    }
    static async deleteProduit(id: string): Promise<void> {
        return await ProduitPrismaService.deleteProduit(id)
    }
}