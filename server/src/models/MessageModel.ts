import { Schema, model } from 'mongoose';
import { IMessage } from '../../interfaces';

interface IMessageModel extends IMessage, Document {}

const MessageModel = new Schema({
    content: {type: String, require: true},
    owner: {type: Schema.Types.ObjectId, ref: 'User', require: true},
    room: {type: Schema.Types.ObjectId, ref: 'Room', require: true},
    createdAt: { type : Date, default: Date.now }
}, {versionKey: false});

export default model<IMessageModel>("Message", MessageModel);