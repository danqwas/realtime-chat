import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description: 'The user email',
    example: 'a@b.com',
    nullable: false,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The user password',
    example: 'Abc123456',
    nullable: false,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;
}

export class LoginResponseDto extends LoginUserDto {
  @ApiProperty({
    description: 'The authentication token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXCVI9...',
    nullable: false,
  })
  id: string;
  @ApiProperty({
    description: 'The authentication token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXCVI9...',
    nullable: false,
  })
  token: string;
}
