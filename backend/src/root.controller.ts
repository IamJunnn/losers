import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootController {
  @Get()
  getRoot() {
    return {
      message: 'API is running',
      status: 'ok',
      timestamp: new Date().toISOString(),
      endpoints: {
        api: '/api',
        auth: '/api/auth',
        posts: '/api/posts'
      }
    };
  }
}