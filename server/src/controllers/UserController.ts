import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../errorHandlers/apiErrorHandler';
import { IUser } from '../../interfaces';
import { userService } from '../services/UserService';

class UserController {
    static async register(req: Request, res: Response, next: NextFunction): Promise<Response<Omit<IUser, 'password'>> | undefined> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) throw ApiError.BadRequest(400, "Incorrect information", errors.array());

            const { username, password, repeat_password } = req.body;

            const DB = await userService.register(username, password, repeat_password);

            res.cookie("token", DB.token, {
                maxAge: 24 * 60 * 60 * 100,
                httpOnly: true,
                sameSite: "lax"
            });

            return res.status(200).json({user: DB.user});
        } catch(err: unknown) {
            next(err);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction): Promise<Response<string> | undefined> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) throw ApiError.BadRequest(400, "Incorrect information", errors.array());

            const { username, password } = req.body;

            const token = await userService.login(username, password);

            res.cookie("token", token, {
                maxAge: 24 * 60 * 60 * 100,
                httpOnly: true,
                sameSite: "lax"
            });

            return res.status(200).json({token});
        } catch(err: unknown) {
            next(err);
        }
    }

    static async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userInfo = req.headers.user as string;

            const user = await userService.getUser(userInfo);

            return res.status(200).json({user});
        } catch(err: unknown) {
            next(err);
        }
    }
}

export default UserController;