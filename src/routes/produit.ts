import express from "express";
import { check, ValidationChain } from "express-validator";
import { authMiddleware } from "../middlewares/auth-middleware.ts";
import { getAllProduits, getProduitById, createProduit, updateProduit, deleteProduit } from "../controllers/produit.ts";

const router = express.Router();

const produitValidationRules: ValidationChain[] = [
    check('name')
        .notEmpty().withMessage('Name is required.')
        .isLength({ max: 100 }).withMessage('Name too long.'),
    check('type')
        .notEmpty().withMessage('Type is required.')
        .isLength({ max: 50 }).withMessage('Type too long.'),
    check('price')
        .notEmpty().withMessage('Price is required.')
        .isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),
    check('rating')
        .notEmpty().withMessage('Rating is required.')
        .isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5.'),
    check('warranty_years')
        .notEmpty().withMessage('Warranty years is required.')
        .isInt({ min: 0 }).withMessage('Warranty years must be a non-negative integer.'),
    check('available')
        .notEmpty().withMessage('Available is required.')
        .isBoolean().withMessage('Available must be a boolean.')
];

router.route('/api/v1/produits')
    .get(authMiddleware, getAllProduits)
    .post(produitValidationRules, createProduit)

router.route('/api/v1/produits/:id')
    .get(authMiddleware, getProduitById)
    .patch(authMiddleware, updateProduit)
    .delete(authMiddleware, deleteProduit);

export default router;