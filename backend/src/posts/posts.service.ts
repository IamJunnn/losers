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

  async getPosts(category?: string, userId?: string) {
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
            },
          },
          votes: {
            select: {
              isUpvote: true,
              userId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Calculate vote scores and user's vote for each post
      const postsWithVoteData = posts.map(post => {
        const upvotes = post.votes.filter(vote => vote.isUpvote).length;
        const downvotes = post.votes.filter(vote => !vote.isUpvote).length;
        const netVotes = upvotes - downvotes;

        const userVote = userId
          ? post.votes.find(vote => vote.userId === userId)?.isUpvote
          : undefined;

        return {
          ...post,
          _count: {
            ...post._count,
            votes: netVotes,
          },
          userVote,
          votes: undefined, // Remove votes array from response
        };
      });

      return postsWithVoteData;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw new InternalServerErrorException('Failed to fetch posts');
    }
  }

  async getPostById(postId: string, userId?: string) {
    try {
      const post = await this.prisma.post.findUniqueOrThrow({
        where: { id: postId },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              nickname: true,
            },
          },
          votes: {
            select: {
              isUpvote: true,
              userId: true,
            },
          },
          comments: {
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
          },
        },
      });

      const upvotes = post.votes.filter(vote => vote.isUpvote).length;
      const downvotes = post.votes.filter(vote => !vote.isUpvote).length;
      const netVotes = upvotes - downvotes;

      const userVote = userId
        ? post.votes.find(vote => vote.userId === userId)?.isUpvote
        : undefined;

      return {
        ...post,
        netVotes,
        userVote,
        votes: undefined, // Remove votes array from response
      };
    } catch (error) {
      if (error.code === 'P2025') { // Prisma's code for not found on findUniqueOrThrow
        throw new NotFoundException('Post not found');
      }
      console.error('Error fetching post by ID:', error);
      throw new InternalServerErrorException('Failed to fetch post');
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

  async votePost(postId: string, userId: string, isUpvote: boolean) {
    try {
      console.log('Vote request:', { postId, userId, isUpvote });

      // First, check if the post exists
      const post = await this.prisma.post.findUnique({
        where: { id: postId }
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Check if user already voted on this post
      const existingVote = await this.prisma.vote.findUnique({
        where: {
          userId_postId: {
            userId,
            postId
          }
        }
      });

      if (existingVote) {
        if (existingVote.isUpvote === isUpvote) {
          // User is clicking the same vote button - remove vote
          await this.prisma.vote.delete({
            where: { id: existingVote.id }
          });
        } else {
          // User is changing their vote
          await this.prisma.vote.update({
            where: { id: existingVote.id },
            data: { isUpvote }
          });
        }
      } else {
        // Create new vote
        await this.prisma.vote.create({
          data: {
            userId,
            postId,
            isUpvote
          }
        });
      }

      // Get updated vote counts
      const upvotes = await this.prisma.vote.count({
        where: { postId, isUpvote: true }
      });

      const downvotes = await this.prisma.vote.count({
        where: { postId, isUpvote: false }
      });

      const netVotes = upvotes - downvotes;

      // Get the updated user vote after the operation
      const updatedVote = await this.prisma.vote.findUnique({
        where: {
          userId_postId: {
            userId,
            postId
          }
        }
      });

      return {
        netVotes,
        upvotes,
        downvotes,
        userVote: updatedVote?.isUpvote ?? null
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error voting on post:', error);
      throw new InternalServerErrorException('Failed to vote on post');
    }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}