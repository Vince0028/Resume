import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LivechatGateway } from './livechat.gateway';
import { LivechatService } from './livechat.service';
import { LivechatController } from './livechat.controller';
import { ChatMessage } from './chat-message.entity';

@Module({
  imports: [],
  controllers: [LivechatController],
  providers: [LivechatGateway, LivechatService],
})
export class LivechatModule { }
