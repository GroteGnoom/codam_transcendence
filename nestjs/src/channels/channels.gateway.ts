import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChannelsService } from './channels.service';
import { SocketMessage } from './message.dtos';

@WebSocketGateway({ cors: { origin: '*', }, })
export class ChannelsGateway {
  constructor(private channelsService: ChannelsService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('sendMessage')
  async handleSendMessage(client: Socket, payload: SocketMessage): Promise<void> {
      payload.message = await this.channelsService.addMessage(payload.channel, payload.message);
      this.server.emit('recMessage', payload);
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
