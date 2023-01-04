import axios, { AxiosRequestConfig } from 'axios';

const BASE_URL = "http://localhost:3003/api";

export const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

api.interceptors.request.use( (config: AxiosRequestConfig) => {
    config.headers = config.headers ?? {};
    config.headers.Authorization = ` Bearer ${localStorage.getItem('token')}`;
    
    return config;
}); 

api.interceptors.response.use(( config ) => {
    return config 
}, async(error) => {
    if (error.response.status === 401) window.location.href = "/login";

    throw error;
});