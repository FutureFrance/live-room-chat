import { Schema, model } from 'mongoose';
import { IUser } from '../interfaces';

interface IUserModel extends IUser, Document {}

const UserModel = new Schema({
    username: {type: String, unique: true, require: true},
    image: {type: String, default: "D.png", require: true},
    password: {type: String, require: true},
    usernameChanges: {type: Number, require: true, default: 0}
}, {versionKey: false});

export default model<IUserModel>("User", UserModel);