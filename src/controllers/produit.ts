import { Request, Response, NextFunction } from "express";
import { Produit } from "../models/produit.ts";
import { PaginatedProduit } from "../../prisma/produit.ts";
import { asyncWrapper } from "../utils/async-wrapper.ts";
import { ProduitService } from "../services/produit.ts";
import { validationResult } from "express-validator";

export const getAllProduits = asyncWrapper(async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const { $limit, $skip, $or = [] } = req.query;
    const limit = parseInt($limit as string);
    const skip = parseInt($skip as string);

    const searchConditions = Array.isArray($or) ? $or.map((condition: any) => {
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

    const produits: PaginatedProduit | null = await ProduitService.getAllProduit(limit, skip, searchConditions);
    if (!produits) {
        throw new Error("No produits found");
    }
    return res.status(200).json(produits);
});

export const getProduitById = asyncWrapper(async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const produitId: string = req.params.id;
    const produit: Produit | null = await ProduitService.getProduitById(produitId);
    if (!produit) {
        throw new Error("Produit not found");
    }
    return res.status(200).json(produit);
});

export const createProduit = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new Error(JSON.stringify(errors.array()));
    }
    const produitToCreate = req.body;
    const produit: Produit = await ProduitService.createProduit(produitToCreate);
    return res.status(201).json(produit);
});

export const updateProduit = asyncWrapper(async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const produitId: string = req.params.id;
    const produitData = req.body;
    
    const existingProduit: Produit | null = await ProduitService.getProduitById(produitId);
    if (!existingProduit) {
        throw new Error("Produit not found");
    }

    const updatedProduit: Produit | null = await ProduitService.updateProduit(produitId, produitData);
    if (!updatedProduit) {
        throw new Error("Produit not found");
    }
    return res.status(200).json(updatedProduit);
});

export const deleteProduit = asyncWrapper(async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const produitId: string = req.params.id;
    const produit: Produit | null = await ProduitService.getProduitById(produitId);
    if (!produit) {
        throw new Error("Produit not found");
    }
    await ProduitService.deleteProduit(produitId);
    return res.status(204).json({ message: "Produit deleted successfully" });
});