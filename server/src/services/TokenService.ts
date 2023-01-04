import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { ApiError } from '../errorHandlers/apiErrorHandler';
import { ITokenPayload } from '../../interfaces';

dotenv.config()

const ACCESSKEY = process.env.ACCESSKEY as string;

class TokenService  {
    async generate(payload: ITokenPayload): Promise<string> {
        const accessToken = jwt.sign(payload, ACCESSKEY, {expiresIn: "59m"});

        return accessToken;
    }

    async verify(token: string): Promise<ITokenPayload>  {
        const accessToken = jwt.verify(token, ACCESSKEY) as ITokenPayload;

        if (!accessToken) throw ApiError.Unauthorized();

        return accessToken;
    }
}

export const tokenService = new TokenService();