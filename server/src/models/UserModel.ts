import { Schema, model } from 'mongoose';
import { IUser } from '../../interfaces';

interface IUserModel extends IUser, Document {}

const UserModel = new Schema({
    username: {type: String, unique: true, require: true},
    image: {type: String, default: "", require: true},
    password: {type: String, require: true}
}, {versionKey: false});

export default model<IUserModel>("User", UserModel);