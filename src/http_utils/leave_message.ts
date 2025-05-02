import axios from "axios";
import Cookies from "js-cookie";
import { BACKEND_URL, SESSION_ID_COOKIE } from "@/settings.json";
import type { LeaveMessage } from "@/models";


export async function getLeaveMessage(guildId: string): Promise<LeaveMessage | null> {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        // raise exception
    }

    const response = await axios.get(`${BACKEND_URL}/leave_message/leave_message`, {
        params: { session_id: sessionId, guild_id: guildId },
    });

    const leaveMessage: LeaveMessage | null = response.data;
    return leaveMessage;
}


export async function putLeaveMessage(guildId: string, channelId: string, message: string): Promise<void> {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        // raise exception
    }

    await axios.put(`${BACKEND_URL}/leave_message/leave_message`, null, {
        params: {
            session_id: sessionId,
            guild_id: guildId,
            channel_id: channelId,
            message: message,
        }
    });
}


export async function deleteLeaveMessage(guildId: string): Promise<void> {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        // raise exception
    }

    await axios.delete(`${BACKEND_URL}/leave_message/leave_message`, {
        params: {
            session_id: sessionId,
            guild_id: guildId,
        }
    });
}
