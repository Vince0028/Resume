import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('guestbook_comments')
export class GuestbookComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column('text')
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
