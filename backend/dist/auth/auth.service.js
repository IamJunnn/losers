"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const argon2 = require("argon2");
let AuthService = class AuthService {
    jwtService;
    prisma;
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.prisma = new client_1.PrismaClient({
            log: ['query', 'info', 'warn', 'error'],
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
            errorFormat: 'pretty',
        });
        this.prisma.$connect().catch((error) => {
            console.error('Failed to connect to database:', error);
        });
    }
    async register(registerDto) {
        const { username, nickname, password } = registerDto;
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { username },
            });
            if (existingUser) {
                throw new common_1.ConflictException('Username already exists');
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
            const payload = { username: user.username, sub: user.id };
            const access_token = this.jwtService.sign(payload);
            return {
                access_token,
                user,
            };
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            console.error('Registration error:', error);
            throw new common_1.InternalServerErrorException(`Failed to create user: ${error.message}`);
        }
    }
    async login(username, password) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { username },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const isPasswordValid = await argon2.verify(user.password, password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const payload = { username: user.username, sub: user.id };
            const access_token = this.jwtService.sign(payload);
            return {
                access_token,
                user: {
                    id: user.id,
                    username: user.username,
                    nickname: user.nickname,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            console.error('Login error:', error);
            throw new common_1.InternalServerErrorException(`Failed to authenticate user: ${error.message}`);
        }
    }
    async getUserCount() {
        try {
            return await this.prisma.user.count();
        }
        catch (error) {
            console.error('User count error:', error);
            throw new common_1.InternalServerErrorException(`Failed to get user count: ${error.message}`);
        }
    }
    async onModuleDestroy() {
        await this.prisma.$disconnect();
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map