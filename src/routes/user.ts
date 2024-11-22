import express from "express";
import { check, ValidationChain } from "express-validator";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import {createUser, deleteUser, getAllUsers, getUserById, login, logout, updateUser} from "../controllers/user.js";

const router = express.Router();

const userValidationRules: ValidationChain[] = [
    check('prenom')
        .notEmpty().withMessage('Prenom is required.')
        .isLength({ max: 50 }).withMessage('Prenom too long.'),
    check('nom')
        .notEmpty().withMessage('Nom is required.')
        .isLength({ max: 50 }).withMessage('Nom too long.'),
    check('email')
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Invalid email format.'),
    check('password')
        .notEmpty().withMessage('Password is required.')
        .isLength({ min: 5 }).withMessage('Password must be at least 5 characters long.')
];

router.route('/api/v1/users')
    .get(authMiddleware, getAllUsers)
    .post(userValidationRules, createUser);

router.route('/api/v1/users/logout')
    .post(authMiddleware, logout);

router.route('/api/v1/users/authentication')
    .post(login);

router.route('/api/v1/users/:id')
    .get(authMiddleware, getUserById)
    .patch(authMiddleware, updateUser)
    .delete(authMiddleware, deleteUser);


router.get('/api/v1/users/protected-route', authMiddleware, (req, res) => {
    res.json({ message: 'Protected data' });
});

export default router;