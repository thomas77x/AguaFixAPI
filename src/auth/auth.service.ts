import { BadRequestException, Injectable } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  register(dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (Buffer.byteLength(dto.password, 'utf8') > 72 || !user || !(await compare(dto.password, user.password))) {
      throw new BadRequestException('Correo o contraseña incorrectos.');
    }
    return {
      message: 'Inicio de sesión exitoso.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isNotificationEnabled: user.isNotificationEnabled,
      },
    };
  }
}
