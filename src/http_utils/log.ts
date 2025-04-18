import axios from "axios";
import Cookies from "js-cookie";
import { BACKEND_URL, SESSION_ID_COOKIE } from "@/settings.json";
import type { Log } from "@/models";


export async function getLogs(guildId: string, limit: number): Promise<Array<Log>> {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        throw new Error("Session ID not found");
    }

    const response = await axios.get(`${BACKEND_URL}/log/logs/${guildId}`, {
        params: { session_id: sessionId, limit: limit },
    })
    const logs: Array<Log> = response.data;
    return logs;
}
