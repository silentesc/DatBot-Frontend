import { BACKEND_URL, SESSION_ID_COOKIE } from "@/settings.json";
import type { Channel, Role } from "@/models";
import axios from "axios";
import Cookies from "js-cookie";


export async function getChannels(guildId: string): Promise<Array<Channel>> {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        throw new Error("Session ID not found");
    }

    const response = await axios.get(`${BACKEND_URL}/guild/channels`, {
        params: { session_id: sessionId, guild_id: guildId },
    });

    let tempChannels: Array<Channel> = response.data;
    const textChannels = tempChannels.filter((channel) => channel.type === 0);
    const categoryChannels = tempChannels.filter((channel) => channel.type === 4).sort(function (a, b) { return a.position - b.position });

    const channels: Array<Channel> = textChannels.filter(textChannel => textChannel.parent_id === null);
    for (const categoryChannel of categoryChannels) {
        channels.push(categoryChannel);
        const textChannelsToAdd: Array<Channel> = textChannels.filter(textChannel => textChannel.parent_id === categoryChannel.id).sort(function (a, b) { return a.position - b.position });
        channels.push(...textChannelsToAdd);
    }

    return channels;
}


export async function getRoles(guildId: string): Promise<Array<Role>> {
    const sessionId = Cookies.get(SESSION_ID_COOKIE);

    if (!sessionId) {
        throw new Error("Session ID not found");
    }

    const response = await axios.get(`${BACKEND_URL}/guild/roles`, {
        params: { session_id: sessionId, guild_id: guildId },
    });

    let roles: Array<Role> = response.data;
    roles = roles.filter((role) => role.name !== "@everyone" && !role.managed).sort((a, b) => b.position - a.position);
    return roles;
}
