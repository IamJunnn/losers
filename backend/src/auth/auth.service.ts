import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse, JwtPayload } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  private prisma: PrismaClient;

  constructor(private jwtService: JwtService) {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      errorFormat: 'pretty',
    });

    // Connect immediately to check connection
    this.prisma.$connect().catch((error) => {
      console.error('Failed to connect to database:', error);
    });
  }

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
      console.error('Registration error:', error);
      throw new InternalServerErrorException(`Failed to create user: ${error.message}`);
    }
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await argon2.verify(user.password, password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload: JwtPayload = { username: user.username, sub: user.id };
      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Login error:', error);
      throw new InternalServerErrorException(`Failed to authenticate user: ${error.message}`);
    }
  }

  async getUserCount(): Promise<number> {
    try {
      return await this.prisma.user.count();
    } catch (error) {
      console.error('User count error:', error);
      throw new InternalServerErrorException(`Failed to get user count: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
