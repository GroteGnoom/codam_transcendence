import { ConfigService } from '@nestjs/config';
import {
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { userStatus } from 'src/typeorm/user.entity';
import { getUserFromClient, get_frontend_host } from 'src/utils';
import { UsersService } from './users.service';


@WebSocketGateway({
    namespace: '/status-ws', // https://stackoverflow.com/questions/66764826/nestjs-socket-io-serving-websockets-from-microservice-at-nested-path-instead-o
    path: '/status-ws/socket.io',
    cors: {
        origin: get_frontend_host(),
        credentials: true
    },
})
export class StatusGateway {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UsersService
    ) {}

    onlineUsers = new Map<number, number>; // key = userID, value = number of user windows (open browsers)

    @WebSocketServer()
    server: Server;

    afterInit(server: Server) {
    }

    handleConnection(client: Socket, ...args: any[]) {      //is ws conncetion opened
        let userID = getUserFromClient(client, this.configService)
        if (!userID)
            return
        userID = Number(userID)
        this.userService.setStatus(userID, userStatus.Online)
        if (this.onlineUsers.has(userID)) {
            this.onlineUsers.set(userID, this.onlineUsers.get(userID) + 1);
        } else {
            this.onlineUsers.set(userID, 1);
        }
        // a user can be logged in multiple times
        // increment user socket count in map
        this.server.emit('statusUpdate', {
            userID: userID,
            status: userStatus.Online,
        });
    }

    handleDisconnect(client: Socket) {                      //is ws conncetion closed
        const userID = getUserFromClient(client, this.configService)
        if (this.onlineUsers.has(userID))
            this.onlineUsers.set(userID, this.onlineUsers.get(userID) - 1);
        if (!this.onlineUsers.get(userID)) { // 0 open windows
            this.userService.setStatus(userID, userStatus.Offline);
            // a user can be logged in multiple times
            // decrement user socket count in map
            // only if the count reaches 0, set the user to offline
            this.server.emit('statusUpdate', {
                userID: userID,
                status: userStatus.Offline,
            });
        }
    }

    inGameStatus(playerID: number, inGame: boolean) {
        this.server.emit('inGameStatusUpdate', {
            userID: playerID,
            inGame: inGame,
        });
    }
}
