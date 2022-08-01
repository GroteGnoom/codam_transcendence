import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChannelsService } from './channels.service';
import { SocketMessage } from './message.dtos';
import { parse } from 'cookie'
import * as cookieParser from 'cookie-parser'
import { ConfigService } from '@nestjs/config';
import { GlobalService } from '../global.service';
import { forwardRef, Inject } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: 'http://127.0.0.1:3000',
    credentials: true
  },
})
export class ChannelsGateway {
  constructor(
    @Inject(forwardRef(() => ChannelsService))
    private channelsService: ChannelsService,
    private readonly configService: ConfigService
  ) {}

  @WebSocketServer()
  server: Server;

  
  private getUserFromClient(client: Socket) {
    const cookie = parse(String(client.handshake.headers.cookie))
		const name = 'transcendence'
		const secret = this.configService.get('SESSION_SECRET');
		const SID = cookieParser.signedCookie(cookie[name], secret)
    return GlobalService.users.get(SID as string)
	}

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: SocketMessage): Promise<void> {
      const userId = this.getUserFromClient(client)
      const userIsMuted = await this.channelsService.checkIfMuted(payload.channel, userId)
      if (userIsMuted)
        return;
      payload.message = await this.channelsService.addMessage(payload.channel, userId, payload.message);
      this.server.emit('recMessage', payload);
  }

  broadcastMuteUser(channel: string, userId: number) {
    this.server.emit('userMuted', {
      channel: channel,
      userId: userId
    });
  }

  broadcastUnmuteUser(channel: string, userId: number) {
    this.server.emit('userUnmuted', {
      channel: channel,
      userId: userId
    });
  }

  afterInit(server: Server) {
    console.log("started up websocket gateway");
    //Do stuffs
  }
}


// import {
//     SubscribeMessage,
//     WebSocketGateway,
//     OnGatewayInit,
//     WebSocketServer,
//     OnGatewayConnection,
//     OnGatewayDisconnect,
//   } from '@nestjs/websockets';
//   import { Socket, Server } from 'socket.io';
//   import { ChannelsService } from './channels.service';
//   import { SocketMessage } from './message.dtos';

//   @WebSocketGateway({
//       cors: {
//       origin: '*',
//       },
//   })
//   export class ChannelsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
//     constructor(private channelsService: ChannelsService) {}
  
//     @WebSocketServer() server: Server;
  
//     @SubscribeMessage('sendMessage')
//     async handleSendMessage(client: Socket, payload: SocketMessage): Promise<void> {
//       console.log("Received a message!!!")
//       await this.channelsService.addMessage(payload.channel, payload.message);
//       this.server.emit('recMessage', payload);
//     }
  
//     afterInit(server: Server) {
//       console.log("started up websocket gateway");
//       //Do stuffs
//     }
  
//     handleDisconnect(client: Socket) {
//       console.log(`Disconnected: ${client.id}`);
//       //Do stuffs
//     }
  
//     handleConnection(client: Socket, ...args: any[]) {
//       console.log(`Connected ${client.id}`);
//       //Do stuffs
//     }
// }

//   Lifecycle hooks#
// There are 3 useful lifecycle hooks available. All of them have corresponding interfaces and are described in the following table:

// OnGatewayInit	Forces to implement the afterInit() method. Takes library-specific server instance as an argument (and spreads the rest if required).
// OnGatewayConnection	Forces to implement the handleConnection() method. Takes library-specific client socket instance as an argument.
// OnGatewayDisconnect	Forces to implement the handleDisconnect() method. Takes library-specific client socket instance as an argument.
