import axios from "axios";
import Cookies from "js-cookie";
import { BACKEND_URL, SESSION_ID_COOKIE } from "@/settings.json";
import type { WelcomeMessage } from "@/models";


export async function getWelcomeMessage(guildId: string): Promise<WelcomeMessage | null> {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        // raise exception
    }

    const response = await axios.get(`${BACKEND_URL}/welcome_message/welcome_message`, {
        params: { session_id: sessionId, guild_id: guildId },
    });

    const welcomeMessage: WelcomeMessage | null = response.data;
    return welcomeMessage;
}


export async function putWelcomeMessage(guildId: string, channelId: string, message: string): Promise<void> {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        // raise exception
    }

    await axios.put(`${BACKEND_URL}/welcome_message/welcome_message`, null, {
        params: {
            session_id: sessionId,
            guild_id: guildId,
            channel_id: channelId,
            message: message,
        }
    });
}


export async function deleteWelcomeMessage(guildId: string): Promise<void> {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        // raise exception
    }

    await axios.delete(`${BACKEND_URL}/welcome_message/welcome_message`, {
        params: {
            session_id: sessionId,
            guild_id: guildId,
        }
    });
}
