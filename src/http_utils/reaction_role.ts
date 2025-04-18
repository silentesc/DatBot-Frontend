import type { EmojiRole, ReactionRole } from "@/models";
import axios from "axios";
import Cookies from "js-cookie";
import { BACKEND_URL, SESSION_ID_COOKIE } from "@/settings.json";


export async function getReactionRoles(guildId: string): Promise<Array<ReactionRole>> {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        throw new Error("Session ID not found");
    }

    const response = await axios.get(`${BACKEND_URL}/reaction_role/reaction_roles`, {
        params: { session_id: sessionId, guild_id: guildId },
    });
    const reactionRoles: Array<ReactionRole> = response.data;
    return reactionRoles;
}


export async function postReactionRole(guildId: string, channelId: string, reaction_role_type: string, message: string, emojiRoles: Array<EmojiRole>): Promise<void> {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        throw new Error("Session ID not found");
    }

    await axios.post(`${BACKEND_URL}/reaction_role/reaction_role`, emojiRoles, {
        params: {
            session_id: sessionId,
            guild_id: guildId,
            channel_id: channelId,
            reaction_role_type: reaction_role_type,
            message: message,
        },
    })
}


export async function deleteReactionRole(guildId: string, channelId: string, messageId: string): Promise<void> {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        throw new Error("Session ID not found");
    }

    await axios.delete(`${BACKEND_URL}/reaction_role/reaction_role`, {
        params: {
            session_id: sessionId,
            guild_id: guildId,
            channel_id: channelId,
            message_id: messageId,
        },
    });
}
