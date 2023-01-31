import { Request, Response, NextFunction, response } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../errorHandlers/apiErrorHandler';
import { IRoom, IRequest, IMessage } from '../../interfaces';
import { roomService } from '../services/RoomService';
import { staticService } from '../services/staticService';

class RoomController {
    static async create(req: Request, res: Response, next: NextFunction): Promise<Response<Omit<IRoom, 'password'>> | undefined> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) throw next(ApiError.BadRequest(400, `Invalid data ${errors.array()[0].msg}`, errors.array()));

            const {room_name, password, repeat_password} = req.body;
            const user = req.headers.user as string;

            const room = await roomService.create(room_name, password, repeat_password, user);

            return res.status(200).json({room});
        } catch(err: unknown) {
            next(err);
        }
    }

    static async join(req: Request, res: Response, next: NextFunction): Promise<Response<Omit<IRoom, 'password'|'image'>> | undefined> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) throw next(ApiError.BadRequest(400, `Invalid data ${errors.array()[0].msg}`, errors.array()));
            
            const { room_name, room_password } = req.body;
            const user = req.headers.user as string;

            const room = await roomService.join(room_name, room_password, user);

            return res.status(200).json({room});
        } catch(err: unknown) {
            next(err);
        }
    }

    static async getMemberOf(req: Request, res: Response, next: NextFunction): Promise<Response<Omit<IRoom[], 'password'>> | undefined> {
        try {
            const userId = req.headers.user as string;

            const rooms = await roomService.getMemberOf(userId);

            return res.status(200).json(rooms);
        } catch(err: unknown) {
            next(err);
        }
    }

    static async uploadImage(req: IRequest, res: Response, next: NextFunction): Promise<Response<boolean> | undefined> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) throw next(ApiError.BadRequest(400, `Invalid data ${errors.array()[0].msg}`, errors.array()));

            const { room_name } = req.body;
            const userId = req.headers.user as string;
            const imagePath = req.file?.originalname as string;
            const buffer = req.file?.buffer as Buffer;

            await staticService.uploadRoomImage(imagePath, room_name, userId, buffer);

            return res.status(200).json({success: true});
        } catch(err: unknown) { 
            const imagePath = req.file?.originalname as string;

            await staticService.removeImage(imagePath);

            next(err);
        }
    }

    static async getFilteredMessages(req: Request, res: Response, next: NextFunction): Promise<Response<IMessage[]> | undefined> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) throw next(ApiError.BadRequest(400, `Invalid data ${errors.array()[0].msg}`, errors.array()));

            const query = req.query.query as string;
            const room = req.query.room as string;
            const user = req.headers.user as string

            const messages = await roomService.getFilteredMessages(query, room, user);

            return res.status(200).json({messages});
        } catch(err: unknown) {
            next(err);
        }
    }

    static async updateRoomName(req: Request, res: Response, next: NextFunction): Promise<Response<{newName: string}> | undefined> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) throw next(ApiError.BadRequest(400, `Invalid data ${errors.array()[0].msg}`, errors.array()));

            const userId = req.headers.user as string;
            const [roomId, roomName] = [req.body.room, req.body.room_name];

            const newName = await roomService.updateRoomName(userId, roomName, roomId);

            return res.status(200).json({newName});
        } catch(err: unknown) {
            next(err);
        }
    }

    static async updateRoomPassword(req: Request, res: Response, next: NextFunction): Promise<Response<boolean> | undefined> {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) throw next(ApiError.BadRequest(400, `Invalid data ${errors.array()[0].msg}`, errors.array()));

            const userId = req.headers.user as string;
            const [roomId, current_password, roomPassword, roomRepeatPassword] = [req.body.roomId, req.body.current_password, req.body.roomPassword, req.body.roomRepeatPassword];

            await roomService.updateRoomPassword(userId, roomId, current_password, roomPassword, roomRepeatPassword);

            return res.status(200).json({success: true});
        } catch(err: unknown) {
            next(err);
        } 
    }
}

export default RoomController;