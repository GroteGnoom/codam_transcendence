import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
  
  @WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
  export class MatchGateway {
    // constructor(private channelsService: ChannelsService) {}
  
    @WebSocketServer()
    server: Server;
  
    @SubscribeMessage('updateBoard')
    async handleSendMessage(client: Socket, payload: any): Promise<void> {
        console.log("Got a board update, emitting to listeners")
        this.server.emit('boardUpdated', payload);
    }
  }
  
  