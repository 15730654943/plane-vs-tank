import { supabase } from './supabase';
import type { User, Profile, LoginCredentials, RegisterCredentials, UpdatePasswordPayload } from '../types/user';

export class AuthService {
  /**
   * 用户注册
   */
  static async register(credentials: RegisterCredentials): Promise<{ user: User | null; error: string | null }> {
    const { email, password, username } = credentials;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: '注册失败，未返回用户信息' };
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email || email,
      created_at: data.user.created_at || new Date().toISOString(),
    };

    return { user, error: null };
  }

  /**
   * 用户登录
   */
  static async login(credentials: LoginCredentials): Promise<{ user: User | null; error: string | null }> {
    const { email, password } = credentials;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: '登录失败，未返回用户信息' };
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email || email,
      created_at: data.user.created_at || new Date().toISOString(),
    };

    return { user, error: null };
  }

  /**
   * 用户登出
   */
  static async logout(): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message || null };
  }

  /**
   * 获取当前用户
   */
  static async getCurrentUser(): Promise<{ user: User | null; error: string | null }> {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: null };
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      created_at: data.user.created_at || new Date().toISOString(),
    };

    return { user, error: null };
  }

  /**
   * 获取当前会话
   */
  static async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error: error?.message || null };
  }

  /**
   * 获取用户Profile
   */
  static async getProfile(userId: string): Promise<{ profile: Profile | null; error: string | null }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { profile: null, error: error.message };
    }

    return { profile: data as Profile, error: null };
  }

  /**
   * 更新用户Profile
   */
  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<{ profile: Profile | null; error: string | null }> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { profile: null, error: error.message };
    }

    return { profile: data as Profile, error: null };
  }

  /**
   * 更新密码
   */
  static async updatePassword(payload: UpdatePasswordPayload): Promise<{ error: string | null }> {
    const { newPassword } = payload;

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { error: error?.message || null };
  }

  /**
   * 发送密码重置邮件
   */
  static async resetPassword(email: string): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error: error?.message || null };
  }

  /**
   * 监听认证状态变化
   */
  static onAuthStateChange(callback: (user: User | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          created_at: session.user.created_at || new Date().toISOString(),
        };
        callback(user);
      } else {
        callback(null);
      }
    });

    return subscription;
  }
}
