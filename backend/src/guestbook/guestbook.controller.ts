
import { Controller, Post, Body, Get, Req, Res, Headers } from '@nestjs/common';
import { GuestbookService } from './guestbook.service';
import { Response, Request } from 'express';
import { CreateCommentDto, SendEmailDto } from './dto/guestbook.dto';

@Controller('guestbook')
export class GuestbookController {
    constructor(private readonly guestbookService: GuestbookService) { }

    @Post('comment')
    async addComment(@Body() body: CreateCommentDto) {
        return this.guestbookService.addComment(body);
    }

    @Post('email')
    async sendEmail(@Body() body: SendEmailDto) {
        return this.guestbookService.sendEmail(body);
    }

    @Get('comments')
    async getComments() {
        return this.guestbookService.getComments();
    }
}
