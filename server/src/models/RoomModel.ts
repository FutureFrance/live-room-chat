import { Schema, model } from 'mongoose';
import { IRoom, DocumentResult } from '../../interfaces';

interface IRoomModel extends IRoom, Document, DocumentResult<IRoom> {}

const RoomModel = new Schema({
    name: {type: String, unique: true, require: true},
    owner: {type: Schema.Types.ObjectId, ref: 'User', require: true},
    password: {type: String, require: true},
    participants: [{type: Schema.Types.ObjectId, ref: 'User'}],
    image: {type: String, require: true, default: "N.png"},
    nameChanges: {type: Number, require: true, default: 0}
}, {versionKey: false});

export default model<IRoomModel>("Room", RoomModel);

