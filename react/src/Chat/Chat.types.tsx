
export interface Channel { 
    name: string;
    owner: number;
    admins: number[];
    members: number[];
    password: string;
    channelType: string;
}

export interface Message {
    id: number;
    sender: number;
    channel: string;
    text: string;
    date: Date;
}