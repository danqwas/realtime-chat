import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
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

  @ApiProperty({
    description: 'The user fullName',
    example: 'John Doe',
    nullable: false,
  })
  @IsString()
  @MinLength(3)
  fullName: string;
}
