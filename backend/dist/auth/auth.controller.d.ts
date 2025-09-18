import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from './interfaces/auth.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<AuthResponse>;
}
