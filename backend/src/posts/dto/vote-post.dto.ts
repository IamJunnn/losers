import { IsBoolean } from 'class-validator';

export class VotePostDto {
  @IsBoolean()
  isUpvote: boolean;
}