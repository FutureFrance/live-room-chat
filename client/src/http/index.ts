import axios from 'axios';

const BASE_URL = `http://${process.env.REACT_APP_HOSTNAME}:3003/api`;

export const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

api.interceptors.response.use(( config ) => {
    return config 
}, async(error) => {
    if (error.response.status === 401) window.location.href = "/login";

    throw error;
});