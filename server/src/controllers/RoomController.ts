import { Request, Response, NextFunction, response } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../errorHandlers/apiErrorHandler';
import { IRoom } from '../../interfaces';
import { roomService } from '../services/RoomService';
import { staticService } from '../services/staticService';

class RoomController {
    static async create(req: Request, res: Response, next: NextFunction): Promise<Response<Omit<IRoom, 'password'>> | undefined> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) throw ApiError.BadRequest(400, "Invalid request body data", errors.array());

            const {room_name, password, repeat_password} = req.body;
            const user = req.headers.user as string;

            const room = await roomService.create(room_name, password, repeat_password, user);

            return res.status(200).json({room});
        } catch(err) {
            next(err);
        }
    }

    static async join(req: Request, res: Response, next: NextFunction): Promise<Response<Omit<IRoom, 'password'|'image'>> | undefined> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) throw ApiError.BadRequest(400, "Invalid request body data", errors.array());
            
            const { room_name, room_password } = req.body;
            const user = req.headers.user as string;

            const room = await roomService.join(room_name, room_password, user);

            return res.status(200).json({room});
        } catch(err) {
            next(err);
        }
    }

    static async getMemberOf(req: Request, res: Response, next: NextFunction): Promise<Response<Omit<IRoom[], 'password'>> | undefined> {
        try {
            const userId = req.headers.user as string;

            const rooms = await roomService.getMemberOf(userId);

            return res.status(200).json(rooms);
        } catch(err) {
            next(err);
        }
    }

    static async uploadImage(req: Request, res: Response, next: NextFunction): Promise<Response<boolean> | undefined> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) throw ApiError.BadRequest(400, "Invalid body data", errors.array());

            const { room_name } = req.body;
            
            const userId = req.headers.user as string;

            const imagePath = req.file?.filename as string;
            console.log(`User: ${userId}, Room: ${room_name}, imagePath: ${imagePath}`)
            await staticService.uploadImage(imagePath, room_name, userId);

            return res.status(200).json({success: true});
        } catch(err) { // think if you need to check whether the owner is trying to delete or any user 
            console.log("WE errored during service or controller and trying to delete the file now")
            const imagePath = req.file?.filename as string;
            console.log("were trying to delete at: ", imagePath)
            if (imagePath !== "") await staticService.removeImage(imagePath);

            next(err);
        }
    }
}

export default RoomController;