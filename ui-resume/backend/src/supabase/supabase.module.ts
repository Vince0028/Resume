
import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Global()
@Module({
    providers: [
        {
            provide: 'SUPABASE_CLIENT',
            useFactory: (configService: ConfigService) => {
                const url = configService.get<string>('SUPABASE_URL');
                const key = configService.get<string>('SUPABASE_KEY');

                if (!url || !key) {
                    throw new Error('Supabase URL or Key is missing in env');
                }

                return createClient(url, key);
            },
            inject: [ConfigService],
        },
    ],
    exports: ['SUPABASE_CLIENT'],
})
export class SupabaseModule { }
