import { User, UserSecrets } from "./user.entity";
import { Channel } from "./channel.entity";
import { Message } from "./message.entity";

const entities = [User, UserSecrets, Channel, Message];

export {User, UserSecrets, Channel, Message};
export default entities;
