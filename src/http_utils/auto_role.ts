import type { Role } from "@/models";
import axios from "axios";
import Cookies from "js-cookie";
import { BACKEND_URL, SESSION_ID_COOKIE } from "@/settings.json";


export async function getAutoRoles(guildId: string): Promise<Array<Role>> {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        throw new Error("Session ID not found");
    }

    const response = await axios.get(`${BACKEND_URL}/auto_role/auto_roles`, {
        params: { session_id: sessionId, guild_id: guildId },
    });
    const autoRoles: Array<Role> = response.data;
    return autoRoles;
}


export async function postAutoRole(guildId: string, roleId: string): Promise<void> {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        throw new Error("Session ID not found");
    }

    await axios.post(`${BACKEND_URL}/auto_role/auto_role`, {
        params: {
            session_id: sessionId,
            guild_id: guildId,
            role_id: roleId,
        },
    })
}


export async function deleteAutoRole(guildId: string, roleId: string): Promise<void> {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        throw new Error("Session ID not found");
    }

    await axios.delete(`${BACKEND_URL}/auto_role/auto_role`, {
        params: {
            session_id: sessionId,
            guild_id: guildId,
            role_id: roleId,
        },
    });
}
