export interface Guild {
    id: string;
    name: string;
    icon: string | null;
    bot_joined: boolean;
}


export interface User {
    id: string;
    username: string;
    avatar: string;
}


export interface Session {
    session_id: string;
    user: User;
    guilds: Array<Guild>;
    expire_timestamp: Date
}


export interface Channel {
    id: string;
    name: string;
    type: number;
    parent_id: string;
    position: number;
}

export interface Role {
    id: string;
    name: string;
    color: number;
    position: number;
    managed: boolean;
}

export interface EmojiRole {
    emoji: string;
    role_id: string;
}


export interface EmojiRoleExtended {
    emoji: string;
    role_id: string;
    role_name: string;
    role_color: number;
    role_position: number;
}

export interface ReactionRole {
    message_id: string;
    guild_id: string;
    channel_id: string;
    channel_name: string;
    channel_type: number;
    channel_parent_id: string;
    channel_position: number;
    type: string;
    message: string;
    emoji_roles: Array<EmojiRoleExtended>;
}


export interface Log {
    guild: Guild;
    user: User;
    action: string;
    timestamp: Date;
}


export interface WelcomeMessage {
    channel: Channel;
    guild: Guild;
    message: string;
}


export interface LeaveMessage {
    channel: Channel;
    guild: Guild;
    message: string;
}


export enum Plugins {
    BOT_SETTINGS = "bot-settings",
    WELCOME_MESSAGE = "welcome-message",
    LEAVE_MESSAGE = "leave-message",
    AUTO_ROLES = "auto-roles",
    REACTION_ROLES = "reaction-roles",
}
