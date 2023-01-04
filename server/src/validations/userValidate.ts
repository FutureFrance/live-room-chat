import { body } from 'express-validator';

export const register = [
    body("username", "Must be between 3 and 22 characters").isLength({min: 3, max: 22}),
    body("password", "Must be at least 6 characters").isLength({min: 6, max: 29}),
    body("repeat_password", "Must be at least 6 characters").isLength({min: 6, max: 29})
];

export const login = [
    body("username", "Must be between 3 and 22 characters").isLength({min: 3, max: 22}),
    body("password", "Must be at least 6 characters").isLength({min: 6, max: 29}),
];