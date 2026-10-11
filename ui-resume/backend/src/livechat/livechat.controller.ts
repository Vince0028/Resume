import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { LivechatService } from './livechat.service';
import { IsString, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @IsString() @IsNotEmpty() username: string;
  @IsString() @IsNotEmpty() message: string;
}

@Controller('livechat')
export class LivechatController {
  constructor(private readonly livechatService: LivechatService) { }

  @Post()
  async sendMessage(@Body() dto: SendMessageDto) {
    return this.livechatService.saveMessage(dto.username, dto.message);
  }

  @Get()
  async getMessages(@Query('limit') limit?: number) {
    return this.livechatService.getRecentMessages(limit || 50);
  }
}
