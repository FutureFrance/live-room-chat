import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errorHandlers/apiErrorHandler';

export const errorHandler = (err: any, req: Request, res: Response, next:NextFunction) => {
    if (err instanceof ApiError) {
        return res.status(err.status).json({"errMessage": err.message, "errors": err.errors});
    }

    if (err instanceof multer.MulterError) {
        return res.status(500).json({status: "error", errMessage: `Unable to process file`, error: err});
    }

    res.status(500).json({"message": `Unexpected error Err:${err}`});
} 