import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../errorHandlers/apiErrorHandler';
import { IRoom } from '../../interfaces';
import { roomService } from '../services/RoomService';

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

    static async join(req: Request, res: Response, next: NextFunction): Promise<Response<Omit<IRoom, 'password'>> | undefined> {
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

}

export default RoomController;