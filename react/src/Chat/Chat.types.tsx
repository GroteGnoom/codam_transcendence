
export interface Channel { 
    name: string;
    owner: number;
    admins: any[];
    members: any[];
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