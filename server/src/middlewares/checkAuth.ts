import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../errorHandlers/apiErrorHandler';
import { tokenService } from '../services/TokenService';

export const checkAuth = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.cookies;

        const isValid = await tokenService.verify(token);

        req.headers.user = isValid.id || "no user invalid";

        next();
    } catch(err) {
        next(ApiError.Unauthorized());
    }
}