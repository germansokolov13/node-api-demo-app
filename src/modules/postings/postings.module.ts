import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostingsController } from './postings.controller';
import { PostingsService } from './postings.service';
import { Posting, PostingSchema } from '../../schemas/posting.schema';
import { ManticoreSearch } from './manticore-search.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Posting.name, schema: PostingSchema }]),
  ],
  controllers: [PostingsController],
  providers: [PostingsService, ManticoreSearch],
})
export class PostingsModule {}
