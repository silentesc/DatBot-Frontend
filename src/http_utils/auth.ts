import axios from "axios";
import Cookies from "js-cookie";
import { BACKEND_URL, SESSION_ID_COOKIE } from "@/settings.json";
import type { Session } from "@/models";


export async function getLogin(): Promise<string> {
    const response = await axios.get(`${BACKEND_URL}/auth/login`);
    const loginUrl: string = response.data;
    return loginUrl;
}


export async function getInvite(): Promise<string> {
    const response = await axios.get(`${BACKEND_URL}/auth/invite`);
    const inviteUrl: string = response.data;
    return inviteUrl;
}


export async function postLogout(): Promise<void> {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        throw new Error("Session ID not found");
    }

    await axios.post(`${BACKEND_URL}/auth/logout`, null, { params: { session_id: sessionId } });
}


export async function getValidateSession(): Promise<Session> {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        throw new Error("Session ID not found");
    }

    const response = await axios.get(`${BACKEND_URL}/auth/validate_session`, { params: { session_id: sessionId } });
    const session: Session = response.data;
    return session;
}


export async function getDiscordCallback(code: string): Promise<Session> {
    const response = await axios.get(`${BACKEND_URL}/auth/discord/callback`, { params: { code: String(code) } });
    const session: Session = response.data;
    return session;
}
