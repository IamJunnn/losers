import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength } from 'class-validator';

export enum Category {
  GENERAL = 'GENERAL',
  COLLEGE = 'COLLEGE',
  ENTREPRENEURS = 'ENTREPRENEURS',
  PROFESSIONALS = 'PROFESSIONALS',
  LIFE = 'LIFE',
}

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsEnum(Category)
  category: Category;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  whatFailed?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  lessonLearned?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  contents?: string;
}