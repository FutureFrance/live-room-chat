import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../errorHandlers/apiErrorHandler';
import { IUser } from '../../interfaces';
import { userService } from '../services/UserService';
import { staticService } from '../services/staticService';

class UserController {
    static async register(req: Request, res: Response, next: NextFunction): Promise<Response<Omit<IUser, 'password'>> | undefined> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) throw next(ApiError.BadRequest(400, `Invalid data ${errors.array()[0].msg}`, errors.array()));

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

    static async login(req: Request, res: Response, next: NextFunction): Promise<Response<boolean> | undefined> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) throw next(ApiError.BadRequest(400, `Invalid data ${errors.array()[0].msg}`, errors.array()));

            const { username, password } = req.body;

            const token = await userService.login(username, password);

            res.cookie("token", token, {
                maxAge: 24 * 60 * 60 * 100,
                httpOnly: true,
                sameSite: "lax"
            });

            return res.status(200).json({success: true});
        } catch(err: unknown) {
            next(err);
        }
    }

    static async getUser(req: Request, res: Response, next: NextFunction): Promise<Response<Omit<IUser, 'password'>> | undefined> {
        try {
            const userInfo = req.headers.user as string;

            const user = await userService.getUser(userInfo);

            return res.status(200).json(user);
        } catch(err: unknown) {
            next(err);
        }
    }

    static async uploadImage(req: Request, res: Response, next: NextFunction): Promise<Response<boolean> | undefined> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) throw next(ApiError.BadRequest(400, `Invalid data ${errors.array()[0].msg}`, errors.array()));

            const userId = req.headers.user as string;
            const imagePath = req.file?.originalname as string;
            const buffer = req.file?.buffer as Buffer;

            await staticService.uploadProfileImage(userId, imagePath, buffer);

            return res.status(200).json({success: true, image: imagePath});
        } catch(err: unknown) {
            console.log("ERRRRRRRRRRRRRRRRRRRRRRRRRRRr", err);
            const imagePath = req.file?.originalname as string;

            await staticService.removeImage(imagePath);

            next(err);
        }
    }

    static async updateProfileUsername(req: Request, res: Response, next: NextFunction): Promise<Response<{newUsername: string}> | undefined> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) throw next(ApiError.BadRequest(400, `Invalid data: ${errors.array()[0].msg}`, errors.array()));
           
            const userId = req.headers.user as string;
            const username = req.body.username;

            const newUsername = await userService.updateProfileUsername(userId, username);

            return res.status(200).json({newUsername});
        } catch(err: unknown) {
            next(err);
        }
    }

    static async updateProfilePassword(req: Request, res: Response, next: NextFunction): Promise<Response<boolean> | undefined> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) throw next(ApiError.BadRequest(400, `Invalid data: ${errors.array()[0].msg}`, errors.array()));

            const userId = req.headers.user as string;
            const [current_password, password, repeat_password] = [req.body.current_password, req.body.password, req.body.repeat_password];

            await userService.updateProfilePassword(userId, current_password, password, repeat_password);

            return res.status(200).json({success: true});
        } catch(err: unknown) {
            next(err);
        }
    }
}

export default UserController;