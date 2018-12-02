import {Component, OnInit} from '@angular/core';
import {ChatRoomModel, MessageModel, PositionModel} from '../chat-room.model';
import * as _ from 'lodash';

declare let L;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  // used for incrementing the ChatRoomId - instead of BE
  chatRoomId = 1;

  map: any;
  chatRoom: ChatRoomModel[] = [];
  currentChatRoom: ChatRoomModel;

  username = '';
  message = '';

  constructor() {
  }

  ngOnInit() {
    this.setInitialMap();
    this.map.on('click', (event) => this.createNewChatRoom(event.latlng));
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
      id: this.chatRoomId,
      messages: [],
      position: position
    };
    this.currentChatRoom = newChatRoom;
    this.chatRoom.push(newChatRoom);

    this.addNewMarker(position);
    this.goToNewPosition(position);

    this.chatRoomId++;

    // clear username when entering a new chatroom
    this.username = '';
  }

  private openChatRoom(position: PositionModel) {
    // clear username when entering another chatroom
    this.username = '';
    this.goToNewPosition(position);
    this.currentChatRoom = _.find(this.chatRoom, ['position', position]);
  }

  sendMessage() {
    const newMessage: MessageModel = {
      username: this.username,
      message: this.message,
      date: new Date()
    };
    this.currentChatRoom.messages.push(newMessage);
    this.message = '';
  }

  private goToNewPosition(newPosition: PositionModel) {
    this.map.panTo(new L.LatLng(newPosition.lat, newPosition.lng));
  }

  private addNewMarker(position: PositionModel) {
    L.marker([position.lat, position.lng]).addTo(this.map).on('click', (event) => this.openChatRoom(event.latlng));
  }
}
