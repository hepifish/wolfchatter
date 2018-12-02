import {Injectable} from '@angular/core';

import * as socketIo from 'socket.io-client';
import {Observable} from 'rxjs';
import {ChatRoomModel, PositionModel} from './chat-room.model';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';

const SERVER_URL = 'http://localhost:8080';

@Injectable()
export class ChatService {
  private socket;

  constructor(private http: HttpClient) {

  }

  public initSocket(): void {
    this.socket = socketIo(SERVER_URL);
  }

  public updateChatRoom(chatRoom: ChatRoomModel): void {
    return this.socket.emit('updateChatroom', chatRoom);
  }

  public createNewChatRoom(chatRoom: ChatRoomModel): void {
    return this.socket.emit('chatroom', chatRoom);
  }

  public onUpdateChatRoom(): Observable<ChatRoomModel> {
    return new Observable<ChatRoomModel>(observer => {
      this.socket.on('updateChatroom', (data: ChatRoomModel) => observer.next(data));
    });
  }

  public onChatRoom(): Observable<ChatRoomModel> {
    return new Observable<ChatRoomModel>(observer => {
      this.socket.on('chatroom', (data: ChatRoomModel) => observer.next(data));
    });
  }

  public getChatRoom(position: PositionModel): Observable<ChatRoomModel> {
    return this.http.get(`/chatRoom/${position.lng}/${position.lat}`).pipe(map(resp => resp as ChatRoomModel));
  }
}
