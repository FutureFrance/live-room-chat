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
        const isUser = await UserModel.findOne({username}, {password: 0, image: 0, usernameChanges: 0})
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
        const user = await UserModel.findOne({_id}, {password: 0})
        .catch(err => {throw ApiError.BadRequest(500, "Fatal Error trying to find this user")});

        if (!user) throw ApiError.BadRequest(400, "Username or password is incorrect");

        return user;
    }

    async updateProfileUsername(id: string, newUsername: string): Promise<string> {
        const user = await UserModel.findOne({_id: id})
        .catch(err => { throw ApiError.BadRequest(500, "Fatal error occurred when trying to upadte the user profile")});

        if (!user) throw ApiError.BadRequest(400, "Unable to update user profile");
        if (newUsername === user.username) throw ApiError.BadRequest(400, "This is you're current username");
        if (user.usernameChanges === 3) throw ApiError.BadRequest(400, "You cant change your username anymore");

        user.username = newUsername;
        user.usernameChanges = user.usernameChanges! + 1;

        await user.save();

        return user.username;
    }

    async updateProfilePassword(id: string, current_password: string, password: string, repeat_password: string): Promise<void> {
        if (password !== repeat_password) throw ApiError.BadRequest(400, "Passwords do not match");

        const user = await UserModel.findOne({_id: id})
        .catch(err => { throw ApiError.BadRequest(500, "Fatal error occured when trying to search for this user")});

        if (!user) throw ApiError.BadRequest(400, "Unable to find this user");
        
        const passwordsMatches = await bcrypt.compare(current_password, user.password);

        if (!passwordsMatches) throw ApiError.BadRequest(400, "Incorrect Password");

        const hashedPassword = await bcrypt.hash(password, parseInt(SALT));

        user.password = hashedPassword;

        await user.save();
    }
}

export const userService = new UserService();