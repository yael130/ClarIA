import { Injectable, inject } from '@angular/core';
import type { User } from '@supabase/supabase-js';
import { SupabaseClientService } from '../supabase/supabase-client.service';

export type StudentSignUpResult = 'signed-in' | 'confirmation-required';

@Injectable({ providedIn: 'root' })
export class StudentAuthService {
  private readonly supabase = inject(SupabaseClientService);

  async getCurrentUser(): Promise<User | null> {
    const client = await this.supabase.getClient();
    if (!client) return null;
    const { data, error } = await client.auth.getSession();
    if (error) throw new Error('No se pudo comprobar la sesión. Vuelve a cargar la página.');
    return data.session?.user ?? null;
  }

  async signIn(email: string, password: string): Promise<User> {
    const client = await this.requireClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error('No pudimos iniciar sesión. Revisa tu correo y contraseña.');
    return data.user;
  }

  async signUp(email: string, password: string): Promise<StudentSignUpResult> {
    const client = await this.requireClient();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: globalThis.location?.origin },
    });
    if (error) throw new Error('No pudimos crear la cuenta. Revisa los datos o intenta iniciar sesión.');
    return data.session ? 'signed-in' : 'confirmation-required';
  }

  async signOut(): Promise<void> {
    const client = await this.requireClient();
    const { error } = await client.auth.signOut();
    if (error) throw new Error('No pudimos cerrar la sesión. Inténtalo de nuevo.');
  }

  private async requireClient() {
    const client = await this.supabase.getClient();
    if (!client) throw new Error('Configura Supabase para usar tu cuenta y guardar el progreso.');
    return client;
  }
}
