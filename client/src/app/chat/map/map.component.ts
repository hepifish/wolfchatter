import {Component, OnInit} from '@angular/core';
import {ChatRoomModel, MessageModel, PositionModel} from '../chat-room.model';
import * as _ from 'lodash';
import {ChatService} from '../chat.service';

declare let L;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  map: any;
  chatRoom: ChatRoomModel[] = [];
  currentChatRoom: ChatRoomModel;

  username = '';
  message = '';

  ioConnection: any;

  constructor(private socketService: ChatService) {
  }

  ngOnInit() {
    this.initIoConnection();
    this.setInitialMap();
    this.map.on('click', (event) => this.createNewChatRoom(event.latlng));
  }

  private initIoConnection(): void {
    this.socketService.initSocket();

    this.ioConnection = this.socketService.onUpdateChatRoom()
      .subscribe((chatroom: ChatRoomModel) => {
        if (this.currentChatRoom) {
          const isEqual = _.isEqual(this.currentChatRoom.position, chatroom.position);
          if (isEqual) {
            this.currentChatRoom = chatroom;
          }
        } else {
          // update the existing chats => improvement, make a get on the chat if opening a new one
          const chatRoomIndex = _.findIndex(this.chatRoom, ['id', chatroom.id]);
          if (chatRoomIndex !== -1) {
            this.chatRoom.splice(chatRoomIndex, 1, chatroom);
          }
        }
      });

    /**
     * When a new chat room is created, display it on the map so the user can join
     */
    this.ioConnection = this.socketService.onChatRoom()
      .subscribe((chatroom: ChatRoomModel) => {
        // if the new chat room's position is the current one, overwrite
        // the current chat room in order to get the id
        if (this.currentChatRoom) {
          const isEqual = _.isEqual(this.currentChatRoom.position, chatroom.position);
          if (isEqual) {
            this.currentChatRoom = chatroom;
          }
        }

        this.chatRoom.push(chatroom);
        this.addNewMarker(chatroom.position);
      });
  }

  public sendMessage(): void {
    const newMessage: MessageModel = {
      username: this.username,
      message: this.message,
      date: new Date()
    };
    this.currentChatRoom.messages.push(newMessage);
    this.socketService.updateChatRoom(this.currentChatRoom);
    this.message = '';
  }

  private setInitialMap() {
    this.map = L.map('map', {
      // Set latitude and longitude of the map center (required)
      center: [46.7712, 23.6236],
      // Set the initial zoom level, values 0-18, where 0 is most zoomed-out (required)
      zoom: 5
    });
    new L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png').addTo(this.map);
    this.map.doubleClickZoom.disable();
  }

  private createNewChatRoom(position: PositionModel) {
    const newChatRoom: ChatRoomModel = {
      id: null,
      messages: [],
      position: position
    };

    this.currentChatRoom = newChatRoom;
    this.goToNewPosition(position);
    this.socketService.createNewChatRoom(newChatRoom);
    // clear username when entering a new chat room
    this.username = '';
  }

  private openChatRoom(position: PositionModel) {
    // clear username when entering another chat room
    this.username = '';
    this.socketService.getChatRoom(position).subscribe(chatRoom => {
      this.currentChatRoom = chatRoom;
      this.goToNewPosition(position);
    });
  }

  private goToNewPosition(newPosition: PositionModel) {
    this.map.panTo(new L.LatLng(newPosition.lat, newPosition.lng));
  }

  private addNewMarker(position: PositionModel) {
    L.marker([position.lat, position.lng]).addTo(this.map).on('click', (event) => this.openChatRoom(event.latlng));
  }
}
