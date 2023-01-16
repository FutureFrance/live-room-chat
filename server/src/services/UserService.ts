import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { ApiError } from "../errorHandlers/apiErrorHandler";
import { IRegister, IUser } from '../../interfaces';
import UserModel from "../models/UserModel";
import { tokenService } from './TokenService';

dotenv.config();

const SALT = process.env.SALT as string;

class UserService {
    async register(username: string, passwd: string, repeatPasswd: string): Promise<IRegister> {
        const isUser = await UserModel.findOne({username}, {password: 0, image: 0})
        .catch(err => {throw ApiError.BadRequest(500, "Fatal error trying to find this user")});

        if (isUser) throw ApiError.BadRequest(400, "This username is already taken");
        if (passwd !== repeatPasswd) throw ApiError.BadRequest(400, "Passwords do not match");

        const passwordHash = await bcrypt.hash(passwd, parseInt(SALT));

        const user = await UserModel.create({
            username: username,
            password: passwordHash
        }).catch(err => {throw ApiError.BadRequest(500, "Fatal error trying to register the account")});

        const accessToken = await tokenService.generate({id: String(user._id)});

        const {password, ...returnUser} = user.toObject();

        return { user: returnUser, token: accessToken }
    }

    async login(username: string, passwd: string): Promise<string> {
        const user = await UserModel.findOne({username})
        .catch(err => {throw ApiError.BadRequest(500, "Fatal error trying to find the user")});

        if (!user) throw ApiError.BadRequest(400, "Username or password is incorrect");

        const passwordsMatches = await bcrypt.compare(passwd, user.password);

        if (!passwordsMatches) throw ApiError.BadRequest(400, "Username or password is incorrect");

        const accessToken = await tokenService.generate({id: String(user._id)});

        return accessToken;
    }

    async getUser(_id: string): Promise<Omit<IUser, 'password'>> {
        const user = await UserModel.findOne({_id}, {password: 0, image: 0})
        .catch(err => {throw ApiError.BadRequest(500, "Fatal Error trying to find this user")});

        if (!user) throw ApiError.BadRequest(400, "Username or password is incorrect");

        return user;
    }
}

export const userService = new UserService();