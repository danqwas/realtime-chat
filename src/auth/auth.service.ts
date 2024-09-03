import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  logger: Logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  /**
   * Logs in a user with the provided email and password.
   *
   * @param {LoginUserDto} loginUserDto - The DTO containing the email and password.
   * @return {Promise<{...User, token: string}>} A promise that resolves to an object containing the user data and a JSON Web Token.
   * @throws {UnauthorizedException} If the email or password is invalid.
   */
  async create(createUserDto: CreateUserDto): Promise<{
    token: string;
    id: string;
    email: string;
    password: string;
    fullName: string;
    isActive: boolean;
    roles: string[];
  }> {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      delete user.password;

      return { ...user, token: this.getJsonWebToken({ id: user.id }) };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }
  /**
   * Logs in a user with the provided email and password.
   *
   * @param {LoginUserDto} loginUserDto - The DTO containing the email and password.
   * @return {Promise<{...User, token: string}>} A promise that resolves to an object containing the user data and a JSON Web Token.
   * @throws {UnauthorizedException} If the email or password is invalid.
   */
  async login(loginUserDto: LoginUserDto): Promise<{
    token: string;
    id: string;
    email: string;
    password: string;
    fullName: string;
    isActive: boolean;
    roles: string[];
  }> {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });
    if (!user)
      throw new UnauthorizedException('Credentials are not Valid (email)');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not Valid (password)');

    return { ...user, token: this.getJsonWebToken({ id: user.id }) };
  }
  /**
   * Checks the authentication status of a given user and returns the user data with a JSON Web Token (JWT).
   *
   * @param {User} user - The user object to check the authentication status for.
   * @return {object} The user data with a JWT token.
   */
  async checkAuthStatus(user: User): Promise<{
    token: string;
    id: string;
    email: string;
    password: string;
    fullName: string;
    isActive: boolean;
    roles: string[];
  }> {
    return { ...user, token: this.getJsonWebToken({ id: user.id }) };
  }
  /**
   * Generates a JSON Web Token (JWT) based on the provided payload.
   *
   * @param {JwtPayload} payload - The payload to be signed and encoded in the JWT.
   * @return {string} The generated JWT.
   */
  private getJsonWebToken(payload: JwtPayload): string {
    const token = this.jwtService.sign(payload);
    return token;
  }
  /**
   * Handles database errors by checking the error code and throwing an exception accordingly.
   *
   * @param {any} error - The error object thrown by the database operation.
   * @return {never} This function never returns, it always throws an exception.
   */
  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error check server logs',
    );
  }
}
