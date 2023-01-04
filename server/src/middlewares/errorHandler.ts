import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errorHandlers/apiErrorHandler';

export const errorHandler = (err: any, req: Request, res: Response, next:NextFunction) => {
    console.log("GOT TO API ERROR HANDLERRRR");

    if (err instanceof ApiError) {
        console.log("API ERROR")
        return res.status(err.status).json({"errMessage": err.message, "errors": err.errors});
    }

    console.log("NOT API ERROR")

    res.status(500).json({"message": "Unexpected error"});
} 