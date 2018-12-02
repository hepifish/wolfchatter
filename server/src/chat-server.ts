import {createServer, Server} from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import {Message} from "./model/message.model";
import {ChatRoom} from "./model/chat-room.model";
import * as _ from 'lodash';
import {Position} from "./model/position.model";

export class ChatServer {
    public static readonly PORT: number = 8080;
    private app: express.Application;
    private server: Server;
    private io: SocketIO.Server;
    private port: string | number;
    private chatRooms: ChatRoom[] = [];

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
    }

    private createApp(): void {
        this.app = express();
    }

    private createServer(): void {
        this.server = createServer(this.app);
    }

    private config(): void {
        this.port = process.env.PORT || ChatServer.PORT;
    }

    private sockets(): void {
        this.io = socketIo(this.server);
    }

    private listen(): void {
        let chatRoomId = 1;
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        this.io.on('connect', (socket: any) => {
            console.log('Connected client on port %s.', this.port);

            socket.on('chatroom', (c: ChatRoom) => {
                // add the id from here
                c.id = chatRoomId;
                console.log('[server](chatroom): %s', JSON.stringify(c));
                this.chatRooms.push(c);
                this.io.emit('chatroom', c);
                chatRoomId++;
            });

            socket.on('updateChatroom', (c: ChatRoom) => {
                console.log('[server](chatroom): %s', JSON.stringify(c));
                const chatRoomIndex = _.findIndex(this.chatRooms, ['id', c.id]);
                if (chatRoomIndex !== -1) {
                    this.chatRooms.splice(chatRoomIndex, 1, c);
                }
                this.io.emit('updateChatroom', c);
            });

            socket.on('message', (m: Message) => {
                console.log('[server](message): %s', JSON.stringify(m));
                this.io.emit('message', m);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });

            this.app.get('/chatRoom/:lng/:lat', (req, res) => {
                const lng = req.params.lng;
                const lat = req.params.lat;
                const position = new Position(+lng, +lat);
                const chatRoomFound = _.find(this.chatRooms, ['position', position]);
                res.end(JSON.stringify(chatRoomFound));
            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}
