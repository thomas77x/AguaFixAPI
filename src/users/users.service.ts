import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { QueryFailedError } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(dto: CreateUserDto) {
    if (Buffer.byteLength(dto.password, 'utf8') > 72) {
      throw new BadRequestException('La contraseña no puede superar 72 bytes.');
    }
    const password = await hash(dto.password, 10);
    try {
      const user = await this.usersRepository.create({ ...dto, password });
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        isNotificationEnabled: user.isNotificationEnabled,
      };
    } catch (error) {
      if (error instanceof QueryFailedError && error.driverError.code === '23505') {
        throw new ConflictException('Ya existe un usuario con ese correo.');
      }
      throw error;
    }
  }

  findByEmailWithPassword(email: string) {
    return this.usersRepository.findByEmailWithPassword(email);
  }
}
