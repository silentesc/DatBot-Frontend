export interface Guild {
    id: string;
    name: string;
    icon: string;
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


export interface UserGuild {
    bot_joined: boolean;
    guild: Guild;
}


export enum Plugins {
    OVERVIEW = "overview",
    WELCOME_MESSAGE = "welcome-message",
    REACTION_ROLES = "reaction-roles",
}
