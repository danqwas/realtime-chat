import { Server, Socket } from 'socket.io';

import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { NewMessageDto } from './dto/new-message.dto';
import { MessageWsService } from './message-ws.service';

@WebSocketGateway({ cors: true })
export class MessageWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  logger: Logger = new Logger('Websockets-Message');
  constructor(
    private readonly messageWsService: MessageWsService,
    private readonly JwtService: JwtService,
  ) {}

  @WebSocketServer() wss: Server;

  /**
   * Handles an incoming WebSocket connection.
   *
   * Verifies the authentication token sent with the connection request.
   * If the token is valid, registers the client and logs the payload.
   * Emits an event to update the list of connected clients.
   *
   * @param {Socket} client - The incoming WebSocket client connection.
   */
  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;

    try {
      payload = this.JwtService.verify(token);

      await this.messageWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }

    this.wss.emit(
      'clients-updated',
      this.messageWsService.getConnectedClients(),
    );
  }
  /**
   * Handles a client disconnection event.
   *
   * Removes the disconnected client from the list of connected clients and emits an event to update the list of connected clients.
   *
   * @param {Socket} client - The disconnected WebSocket client connection.
   * @return {void} This function does not return anything.
   */
  handleDisconnect(client: Socket) {
    this.messageWsService.removeClient(client.id);

    this.wss.emit(
      'clients-updated',
      this.messageWsService.getConnectedClients(),
    );
  }

  /**
   * Handles a message received from a client and broadcasts it to all connected clients.
   *
   * @param {Socket} client - The WebSocket client connection that sent the message.
   * @param {NewMessageDto} payload - The message payload sent by the client.
   * @return {void} This function does not return anything.
   */
  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto) {
    try {
      this.wss.emit('message-from-server', {
        fullName: this.messageWsService.getUserFullName(client.id),
        message: payload.message || 'no message',
      });
    } catch (error) {
      this.logger.error(`Error emitting message to clients: ${error.message}`);
    }
  }
}
