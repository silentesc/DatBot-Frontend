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
