import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class Supabase {
    database: SupabaseClient;

    constructor() {
        this.database = createClient(`${process.env.SUPABASE_URL}`, `${process.env.SUPABASE_KEY}`);
    }
}
