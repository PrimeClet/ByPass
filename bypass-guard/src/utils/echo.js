import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axios from 'axios';
import { store } from '@/store/store'; // ton Redux store


window.Pusher = Pusher;

const state = store.getState();
const token = state.user.token; // récupère le token depuis Redux

const echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,

    authEndpoint: "http://127.0.0.1:8001/broadcasting/auth",

    auth: {
        headers: {
        Authorization: `Bearer ${token}`, // si tu utilises sanctum ou jwt
        },
    },
});

export default echo;
