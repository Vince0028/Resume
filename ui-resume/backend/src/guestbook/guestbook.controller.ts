import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { GuestbookService } from './guestbook.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('guestbook')
export class GuestbookController {
  constructor(private readonly guestbookService: GuestbookService) {}

  @Post()
  async create(@Body() dto: CreateCommentDto) {
    return this.guestbookService.create(dto);
  }

  @Get()
  async findAll() {
    return this.guestbookService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.guestbookService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.guestbookService.remove(id);
  }
}
