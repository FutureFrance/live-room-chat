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

    async uploadRoomImage(file: File, room_name: string) {
        const response = await api.post("/room/image/upload", {
            image: file, 
            room_name: room_name}, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        return response;
    }

    async uploadProfileImage(file: File) {
        const response = await api.post("/profile/image/upload", {
            image: file}, {
            headers: {'Content-Type': 'multipart/form-data'}
        });

        return response;
    }

    async getFilteredMessage(query: string, roomId: string) {
        return await api.get(`/messages?query=${query}&room=${roomId}`);
    }

    async changeUsername(newUsername: string) {
        const response = await api.post<{newUsername: string}>(`/update/user/username`, JSON.stringify({
            username: newUsername}), {
            headers: {"Content-Type": "application/json"}                
        });

        return response;
    }

    async changePassword(current_password: string, password: string, repeat_password: string) {
        const response = await api.post("/update/user/password", JSON.stringify({
            current_password, password, repeat_password}), {
            headers: {"Content-Type": "application/json"}
        });

        return response;
    }

    async changeAvatarImage(file: File) {
        const response = await api.post<{success: boolean, image: string}>("/profile/image/upload", {
            image: file}, {
            headers: {'Content-Type': 'multipart/form-data'}
        });

        return response;
    }
}

export const apiService = new ApiService();