import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestbookController } from './guestbook.controller';
import { GuestbookService } from './guestbook.service';
import { GuestbookComment } from './guestbook-comment.entity';

@Module({
  imports: [],
  controllers: [GuestbookController],
  providers: [GuestbookService],
})
export class GuestbookModule { }
