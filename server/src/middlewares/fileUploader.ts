import { Request } from 'express';
import multer from 'multer';
import path from 'path';
import { ApiError } from '../errorHandlers/apiErrorHandler';

const storage = multer.memoryStorage();

export const verifyUploadFile = multer({
    storage: storage,
    fileFilter: function (req: Request, file, callback) {
        const fileExtension = file.originalname.split('.')[1];
        const whitelist = ['png', 'jpg', 'jpeg'];

        if ((file.originalname.split('.').length !== 2) || (!whitelist.includes(fileExtension))) {
            callback(new ApiError(400, "Only [.png, .jpg, .jpeg] are allowed"));
        }

        const fileName = file.originalname.split('.')[0];

        file.originalname = Date.now() + '-' + fileName + path.extname(fileName.replace('\\', '')) + '.jpg';

        callback(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024
    }
}).single("image");

