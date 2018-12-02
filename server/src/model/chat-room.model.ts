import {Message} from "./message.model";

export interface ChatRoom {
    id: number;
    messages: Message[];
    position: Position;
}
