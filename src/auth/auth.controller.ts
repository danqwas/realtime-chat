/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { Auth, GetUser } from './decorators';
import { CreateUserDto, LoginUserDto } from './dto';
import { LoginResponseDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({
    status: 200,
    description: 'The user was successfully created',
    //return type of the response the token will be generated with the user data
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto): Promise<LoginResponseDto> {
    return this.authService.create(createUserDto);
  }

  @ApiResponse({
    status: 200,
    description: 'The user was checked',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Get('check-auth-status')
  @Auth()
  @ApiBearerAuth()
  checkAuthStatus(@GetUser() user: User): Promise<LoginResponseDto> {
    return this.authService.checkAuthStatus(user);
  }

  @ApiResponse({
    status: 200,
    description: 'The user was successfully created',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    return this.authService.login(loginUserDto);
  }
}
