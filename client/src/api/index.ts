import { api } from '../http/index';
import { IRoomResponse, ILoginResponse, IRegisterResponse, IUser, IRoom } from '../interfaces';

class ApiService {
    async auth() {
        return await api.get<Omit<IUser, 'password'>>("/user");
    }

    async register(username: string, password: string, repeat_password: string) {
        const response = await api.post<IRegisterResponse>("/register", JSON.stringify({
            username, password, repeat_password}), {
            headers: {"Content-Type": "application/json"}
        });

        return response;
    }

    async login(username: string, password: string) {
        const response = await api.post<ILoginResponse>("/login", JSON.stringify({
            username, password}), {
            headers: {"Content-Type": "application/json"}
        });

        return response;
    }

    async createRoom(room_name: string, password: string, repeat_password: string) {
        const response = await api.post<IRoomResponse>("/room/create", JSON.stringify({
            room_name, password, repeat_password}), {
            headers: {"Content-Type": "application/json"}
        });

        return response;
    }

    async joinRoom(room_name: string, room_password: string) {
        const response = await api.post<IRoomResponse>("/room/join", JSON.stringify({
            room_name, room_password }), {
            headers: {"Content-Type":"application/json"}
        });
        return response;
    }

    async getRooms() {
        return await api.get<Omit<IRoom[], 'password'>>("/rooms");
    }

    async uploadImage(file: File, room_name: string) {
        const response = await api.post("/image/upload", {
            room_image: file, 
            room_name: room_name}, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        return response;
    }

    async getFilteredMessage(query: string, roomId: string) {
        return await api.get(`/messages?query=${query}&room=${roomId}`);
    }
}

export const apiService = new ApiService();