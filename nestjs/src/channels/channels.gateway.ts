import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChannelsService } from './channels.service';
import { SocketMessage } from './message.dtos';
import { ConfigService } from '@nestjs/config';
import { forwardRef, Inject } from '@nestjs/common';
import { getUserFromClient } from 'src/utils';
import { get_frontend_host } from 'src/utils';
import { Session } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/channels-ws', // https://stackoverflow.com/questions/66764826/nestjs-socket-io-serving-websockets-from-microservice-at-nested-path-instead-o
  path: '/channels-ws/socket.io',
  cors: {
    origin: get_frontend_host(),
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

  handleConnection(client: Socket, @Session() session) {
    if (!getUserFromClient(client, this.configService)) {
      this.server.emit("redirectHomeChat", {"client": client.id});
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: SocketMessage): Promise<void> {
      const userId = getUserFromClient(client, this.configService)
      const userIsMuted = await this.channelsService.checkIfMuted(payload.channel, userId)
      if (payload.message.text.length > 140)
        return;
      if (userIsMuted)
        return;
      payload.message = await this.channelsService.addMessage(payload.channel, userId, payload.message);
      this.server.emit('recMessage', payload);
  }

  broadcastNewDM(channel: string) {
    this.server.emit('newDM', {
      channel: channel,
    });
  }

  broadcastNewChannel(channel: string) {
    this.server.emit('newChannel', {
      channel: channel,
    });
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
  }
}

//   Lifecycle hooks
// There are 3 useful lifecycle hooks available. All of them have corresponding interfaces and are described in the following table:

// OnGatewayInit	Forces to implement the afterInit() method. Takes library-specific server instance as an argument (and spreads the rest if required).
// OnGatewayConnection	Forces to implement the handleConnection() method. Takes library-specific client socket instance as an argument.
// OnGatewayDisconnect	Forces to implement the handleDisconnect() method. Takes library-specific client socket instance as an argument.
