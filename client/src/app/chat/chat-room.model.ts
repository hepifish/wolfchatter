export interface ChatRoomModel {
  id: number;
  messages: MessageModel[];
  position: PositionModel;
}

export interface MessageModel {
  username: string;
  message: string;
  date: Date;
}

export interface PositionModel {
  lng: number;
  lat: number;
}
