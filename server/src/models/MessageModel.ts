import { Schema, model } from 'mongoose';
import { IMessage } from '../../interfaces';

interface IMessageModel extends IMessage, Document {}

const MessageModel = new Schema({
    content: {type: String, require: true},
    isFile: {type: Boolean, require: true, default: false},
    owner: {type: Schema.Types.ObjectId, ref: 'User', require: true},
    room: {type: Schema.Types.ObjectId, ref: 'Room', require: true},
    createdAt: { type : String, require: true }
}, {versionKey: false});

export default model<IMessageModel>("Message", MessageModel);