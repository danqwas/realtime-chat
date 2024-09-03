import { Socket } from 'socket.io';
import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../auth/entities/user.entity';

interface ConnectedClients {
  [id: string]: {
    user: User;
    socket: Socket;
  };
}
@Injectable()
export class MessageWsService {
  private connectedClients: ConnectedClients = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Registers a client with the given user ID.
   *
   * @param {Socket} client - The client to register.
   * @param {string} userId - The ID of the user to register the client for.
   * @throws {Error} If the user is not found or is not active.
   * @return {Promise<void>} A promise that resolves when the client has been registered.
   */
  async registerClient(client: Socket, userId: string) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.isActive) {
      throw new Error('User is not active');
    }
    this.checkUserConnection(user);
    this.connectedClients[client.id] = {
      user,
      socket: client,
    };
  }
  /**
   * Removes a client from the list of connected clients by their client ID.
   *
   * @param {string} clientId - The ID of the client to be removed.
   * @return {void} This function does not return anything.
   */
  removeClient(clientId: string) {
    delete this.connectedClients[clientId];
  }

  /**
   * Retrieves a list of IDs of all currently connected clients.
   *
   * @return {string[]} An array of client IDs.
   */
  getConnectedClients(): string[] {
    return Object.keys(this.connectedClients);
  }
  /**
   * Retrieves the full name of a user based on their socket ID.
   *
   * @param {string} socketId - The unique identifier of the user's socket.
   * @return {string} The full name of the user associated with the socket ID.
   */
  getUserFullName(socketId: string) {
    return this.connectedClients[socketId].user.fullName;
  }
  /**
   * Checks if a user is already connected and disconnects any existing connections.
   *
   * @param {User} user - The user to check for existing connections.
   * @return {void} No return value.
   */
  private checkUserConnection(user: User) {
    for (const socketId in this.connectedClients) {
      const connectedClient = this.connectedClients[socketId];

      if (connectedClient.user.id === user.id) {
        connectedClient.socket.disconnect();
        break;
      }
    }
  }
}
