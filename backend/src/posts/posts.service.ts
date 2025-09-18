import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class PostsService {
  private prisma = new PrismaClient();

  async createPost(createPostDto: CreatePostDto, authorId: string) {
    try {
      const post = await this.prisma.post.create({
        data: {
          ...createPostDto,
          authorId,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              nickname: true,
            },
          },
          _count: {
            select: {
              comments: true,
              votes: true,
            },
          },
        },
      });

      return post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw new InternalServerErrorException('Failed to create post');
    }
  }

  async getPosts(category?: string) {
    try {
      const posts = await this.prisma.post.findMany({
        where: category ? { category: category as any } : undefined,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              nickname: true,
            },
          },
          _count: {
            select: {
              comments: true,
              votes: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return posts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw new InternalServerErrorException('Failed to fetch posts');
    }
  }

  async deletePost(postId: string, userId: string) {
    try {
      // First, check if the post exists and get the author
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true }
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Check if the user is the author of the post
      if (post.authorId !== userId) {
        throw new ForbiddenException('You can only delete your own posts');
      }

      // Delete the post
      await this.prisma.post.delete({
        where: { id: postId }
      });

      return { message: 'Post deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Error deleting post:', error);
      throw new InternalServerErrorException('Failed to delete post');
    }
  }

  async createComment(postId: string, createCommentDto: CreateCommentDto, authorId: string) {
    try {
      // First, check if the post exists
      const post = await this.prisma.post.findUnique({
        where: { id: postId }
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Create the comment
      const comment = await this.prisma.comment.create({
        data: {
          content: createCommentDto.content,
          postId,
          authorId,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              nickname: true,
            },
          },
        },
      });

      return comment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error creating comment:', error);
      throw new InternalServerErrorException('Failed to create comment');
    }
  }

  async getComments(postId: string) {
    try {
      // First, check if the post exists
      const post = await this.prisma.post.findUnique({
        where: { id: postId }
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Get all comments for the post
      const comments = await this.prisma.comment.findMany({
        where: { postId },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              nickname: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return comments;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching comments:', error);
      throw new InternalServerErrorException('Failed to fetch comments');
    }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}