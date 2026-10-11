import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { LivechatModule } from './livechat/livechat.module';
import { GuestbookModule } from './guestbook/guestbook.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule, // Global Supabase Client
    // TypeOrmModule.forRoot({ ... }), // Disabled MySQL connection
    LivechatModule,
    GuestbookModule,
  ],
})
export class AppModule { }
