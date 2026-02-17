
import { Module } from '@nestjs/common';
import { GuestbookModule } from './guestbook/guestbook.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule.forRoot(), GuestbookModule],
})
export class AppModule { }
