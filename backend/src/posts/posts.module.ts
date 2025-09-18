import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'failure-feed-super-secret-jwt-key-2024',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '14d' },
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}