import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseFilters,
  ValidationPipe,
  ForbiddenException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { VotePostDto } from './dto/vote-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

@Controller('posts')
@UseFilters(HttpExceptionFilter)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createPostDto: CreatePostDto,
    @Request() req: any,
  ) {
    return this.postsService.createPost(createPostDto, req.user.userId);
  }

  @Get()
  async getPosts(@Query('category') category?: string, @Request() req?: any) {
    const userId = req?.user?.userId; // Will be undefined if not authenticated
    return this.postsService.getPosts(category, userId);
  }

  @Get(':id')
  async getPostById(@Param('id') postId: string, @Request() req?: any) {
    const userId = req?.user?.userId; // Will be undefined if not authenticated
    return this.postsService.getPostById(postId, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') postId: string, @Request() req: any) {
    return this.postsService.deletePost(postId, req.user.userId);
  }

  @Get(':id/comments')
  async getComments(@Param('id') postId: string) {
    return this.postsService.getComments(postId);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Param('id') postId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createCommentDto: CreateCommentDto,
    @Request() req: any,
  ) {
    return this.postsService.createComment(postId, createCommentDto, req.user.userId);
  }

  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async votePost(
    @Param('id') postId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    voteData: VotePostDto,
    @Request() req: any,
  ) {
    return this.postsService.votePost(postId, req.user.userId, voteData.isUpvote);
  }
}