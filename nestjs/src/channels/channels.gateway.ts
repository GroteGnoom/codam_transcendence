import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Socket, Server } from 'socket.io';
  import { ChannelsService } from './channels.service';
  import { SocketMessage } from './message.dtos';
  @WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
  export class ChannelsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
  {
    constructor(private channelsService: ChannelsService) {}
  
    @WebSocketServer() server: Server;
  
    @SubscribeMessage('sendMessage')
    async handleSendMessage(client: Socket, payload: SocketMessage): Promise<void> {
      console.log("Received a message!!!")
      await this.channelsService.addMessage(payload.channel, payload.message);
      this.server.emit('recMessage', payload);
    }
  
    afterInit(server: Server) {
      console.log("started up websocket gateway");
      //Do stuffs
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Disconnected: ${client.id}`);
      //Do stuffs
    }
  
    handleConnection(client: Socket, ...args: any[]) {
      console.log(`Connected ${client.id}`);
      //Do stuffs
    }
  }