import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseFilters,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from './interfaces/auth.interface';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

@Controller('auth')
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    registerDto: RegisterDto,
  ): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }
}
