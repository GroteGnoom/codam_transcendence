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

    @WebSocketServer()
    server: Server;

    afterInit(server: Server) {
        console.log("started up status websocket gateway");
    }

    handleConnection(client: Socket, ...args: any[]) {      //is ws conncetion opened
        const userID = getUserFromClient(client, this.configService)
        console.log(`User ${userID} status: Connected`);
        this.userService.setStatus(userID, userStatus.Online)
        this.server.emit('statusUpdate', {
            userID: userID,
            status: userStatus.Online,
        });
    }

    handleDisconnect(client: Socket) {                      //is ws conncetion closed
        const userID = getUserFromClient(client, this.configService)
        console.log(`User ${userID} status: Disconnected:`);
        this.userService.setStatus(userID, userStatus.Offline);
        this.server.emit('statusUpdate', {
            userID: userID,
            status: userStatus.Offline,
        });
    }
}
