import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse, JwtPayload } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  private prisma = new PrismaClient();

  constructor(private jwtService: JwtService) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { username, nickname, password } = registerDto;

    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { username },
      });

      if (existingUser) {
        throw new ConflictException('Username already exists');
      }

      const hashedPassword = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1,
      });

      const user = await this.prisma.user.create({
        data: {
          username,
          nickname,
          password: hashedPassword,
        },
        select: {
          id: true,
          username: true,
          nickname: true,
        },
      });

      const payload: JwtPayload = { username: user.username, sub: user.id };
      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
