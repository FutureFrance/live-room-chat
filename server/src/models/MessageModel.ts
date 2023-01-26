import { Schema, model } from 'mongoose';
import { IMessage } from '../../interfaces';

interface IMessageModel extends IMessage, Document {}

const MessageModel = new Schema({
    content: {type: String, require: true},
    file: {type: String, require: true, default: "none"},
    owner: {type: Schema.Types.ObjectId, ref: 'User', require: true},
    room: {type: Schema.Types.ObjectId, ref: 'Room', require: true},
    createdAt: { type : String, require: true }
}, {versionKey: false});

export default model<IMessageModel>("Message", MessageModel);