import { api } from '../http/index';
import { IRoomResponse, ILoginResponse, IRegisterResponse, IUser } from '../interfaces';

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
}

export const apiService = new ApiService();