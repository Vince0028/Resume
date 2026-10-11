import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { ChatMessage } from './chat-message.entity';

@Injectable()
export class LivechatService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) { }

  async saveMessage(username: string, message: string): Promise<ChatMessage> {
    const { data, error } = await this.supabase
      .from('livechat')
      .insert({ username, message })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      ...data,
      createdAt: new Date(data.created_at),
    } as ChatMessage;
  }

  async getRecentMessages(limit = 50): Promise<ChatMessage[]> {
    const { data, error } = await this.supabase
      .from('livechat')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);

    return (data || []).map(item => ({
      ...item,
      createdAt: new Date(item.created_at),
    })) as ChatMessage[];
  }
}
