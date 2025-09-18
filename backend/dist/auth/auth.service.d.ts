import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from './interfaces/auth.interface';
export declare class AuthService {
    private jwtService;
    private prisma;
    constructor(jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<AuthResponse>;
    login(username: string, password: string): Promise<AuthResponse>;
    onModuleDestroy(): Promise<void>;
}
