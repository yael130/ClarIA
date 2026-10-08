import { Injectable } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import type { Database } from './database.types';

@Injectable({ providedIn: 'root' })
export class SupabaseClientService {
  private clientPromise: Promise<SupabaseClient<Database> | null> | null = null;

  getClient(): Promise<SupabaseClient<Database> | null> {
    if (this.clientPromise) return this.clientPromise;
    const url = environment.supabaseUrl.trim();
    const publishableKey = environment.supabaseAnonKey.trim();
    if (!url || !publishableKey) {
      this.clientPromise = Promise.resolve(null);
      return this.clientPromise;
    }

    this.clientPromise = import('@supabase/supabase-js')
      .then(({ createClient }) => createClient<Database>(url, publishableKey, {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: true,
          persistSession: true,
        },
      }))
      .catch(() => null);
    return this.clientPromise;
  }
}
