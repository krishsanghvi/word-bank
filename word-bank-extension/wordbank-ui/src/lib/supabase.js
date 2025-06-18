import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

/**
 * Database table schemas for social learning platform
 * 
 * Run these SQL commands in your Supabase dashboard to set up the database:
 * 
 * -- Users table (extends Supabase auth.users)
 * CREATE TABLE public.user_profiles (
 *   id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
 *   username TEXT UNIQUE NOT NULL,
 *   avatar_url TEXT,
 *   level INTEGER DEFAULT 1,
 *   total_xp INTEGER DEFAULT 0,
 *   current_streak INTEGER DEFAULT 0,
 *   longest_streak INTEGER DEFAULT 0,
 *   badges TEXT[] DEFAULT '{}',
 *   preferences JSONB DEFAULT '{}',
 *   stats JSONB DEFAULT '{}',
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   last_active TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- Study Groups
 * CREATE TABLE public.study_groups (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   description TEXT,
 *   owner_id UUID REFERENCES auth.users ON DELETE CASCADE,
 *   is_private BOOLEAN DEFAULT false,
 *   invite_code TEXT UNIQUE,
 *   settings JSONB DEFAULT '{}',
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- Group Members
 * CREATE TABLE public.group_members (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   group_id UUID REFERENCES public.study_groups ON DELETE CASCADE,
 *   user_id UUID REFERENCES auth.users ON DELETE CASCADE,
 *   role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
 *   joined_at TIMESTAMPTZ DEFAULT NOW(),
 *   contribution INTEGER DEFAULT 0,
 *   is_active BOOLEAN DEFAULT true,
 *   UNIQUE(group_id, user_id)
 * );
 * 
 * -- Shared Words
 * CREATE TABLE public.shared_words (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   word TEXT NOT NULL,
 *   definitions JSONB NOT NULL,
 *   category TEXT,
 *   shared_by UUID REFERENCES auth.users ON DELETE CASCADE,
 *   shared_in UUID, -- Can reference groups or users
 *   note TEXT,
 *   tags TEXT[] DEFAULT '{}',
 *   likes INTEGER DEFAULT 0,
 *   liked_by UUID[] DEFAULT '{}',
 *   shared_at TIMESTAMPTZ DEFAULT NOW(),
 *   is_public BOOLEAN DEFAULT false
 * );
 * 
 * -- Word Comments
 * CREATE TABLE public.word_comments (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   word_id UUID REFERENCES public.shared_words ON DELETE CASCADE,
 *   user_id UUID REFERENCES auth.users ON DELETE CASCADE,
 *   content TEXT NOT NULL,
 *   likes INTEGER DEFAULT 0,
 *   liked_by UUID[] DEFAULT '{}',
 *   parent_id UUID REFERENCES public.word_comments ON DELETE CASCADE,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   is_edited BOOLEAN DEFAULT false
 * );
 * 
 * -- Word of the Day
 * CREATE TABLE public.word_of_the_day (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   word TEXT NOT NULL,
 *   definitions JSONB NOT NULL,
 *   etymology TEXT,
 *   fun_fact TEXT,
 *   submitted_by UUID REFERENCES auth.users ON DELETE CASCADE,
 *   votes INTEGER DEFAULT 0,
 *   voted_by UUID[] DEFAULT '{}',
 *   featured_date DATE UNIQUE,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- Competitions
 * CREATE TABLE public.competitions (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   title TEXT NOT NULL,
 *   description TEXT,
 *   type TEXT NOT NULL CHECK (type IN ('word_battle', 'speed_round', 'team_challenge', 'tournament')),
 *   status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'completed', 'cancelled')),
 *   settings JSONB DEFAULT '{}',
 *   prizes JSONB DEFAULT '{}',
 *   start_time TIMESTAMPTZ,
 *   end_time TIMESTAMPTZ,
 *   created_by UUID REFERENCES auth.users ON DELETE CASCADE,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- Competition Participants
 * CREATE TABLE public.competition_participants (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   competition_id UUID REFERENCES public.competitions ON DELETE CASCADE,
 *   user_id UUID REFERENCES auth.users ON DELETE CASCADE,
 *   team_id UUID,
 *   score INTEGER DEFAULT 0,
 *   rank INTEGER,
 *   stats JSONB DEFAULT '{}',
 *   is_active BOOLEAN DEFAULT true,
 *   joined_at TIMESTAMPTZ DEFAULT NOW(),
 *   UNIQUE(competition_id, user_id)
 * );
 * 
 * -- Forum Threads
 * CREATE TABLE public.forum_threads (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   title TEXT NOT NULL,
 *   content TEXT NOT NULL,
 *   author_id UUID REFERENCES auth.users ON DELETE CASCADE,
 *   category TEXT NOT NULL,
 *   tags TEXT[] DEFAULT '{}',
 *   is_pinned BOOLEAN DEFAULT false,
 *   is_locked BOOLEAN DEFAULT false,
 *   views INTEGER DEFAULT 0,
 *   replies INTEGER DEFAULT 0,
 *   likes INTEGER DEFAULT 0,
 *   liked_by UUID[] DEFAULT '{}',
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   last_activity TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- Forum Posts
 * CREATE TABLE public.forum_posts (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   thread_id UUID REFERENCES public.forum_threads ON DELETE CASCADE,
 *   author_id UUID REFERENCES auth.users ON DELETE CASCADE,
 *   content TEXT NOT NULL,
 *   likes INTEGER DEFAULT 0,
 *   liked_by UUID[] DEFAULT '{}',
 *   parent_post_id UUID REFERENCES public.forum_posts ON DELETE CASCADE,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   is_edited BOOLEAN DEFAULT false,
 *   is_deleted BOOLEAN DEFAULT false
 * );
 * 
 * -- Notifications
 * CREATE TABLE public.notifications (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users ON DELETE CASCADE,
 *   type TEXT NOT NULL,
 *   title TEXT NOT NULL,
 *   message TEXT NOT NULL,
 *   data JSONB DEFAULT '{}',
 *   is_read BOOLEAN DEFAULT false,
 *   action_url TEXT,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- Leaderboards
 * CREATE TABLE public.leaderboards (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   title TEXT NOT NULL,
 *   period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'alltime')),
 *   metric TEXT NOT NULL,
 *   entries JSONB NOT NULL,
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- Achievements
 * CREATE TABLE public.achievements (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   title TEXT NOT NULL,
 *   description TEXT NOT NULL,
 *   icon TEXT NOT NULL,
 *   tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
 *   xp_reward INTEGER DEFAULT 0,
 *   criteria JSONB NOT NULL,
 *   is_secret BOOLEAN DEFAULT false,
 *   unlocked_by INTEGER DEFAULT 0,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- User Achievements
 * CREATE TABLE public.user_achievements (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users ON DELETE CASCADE,
 *   achievement_id UUID REFERENCES public.achievements ON DELETE CASCADE,
 *   unlocked_at TIMESTAMPTZ DEFAULT NOW(),
 *   UNIQUE(user_id, achievement_id)
 * );
 * 
 * -- Row Level Security (RLS) Policies
 * ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.shared_words ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.word_comments ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
 * 
 * -- Sample RLS policies (add more as needed)
 * CREATE POLICY "Users can view their own profile" ON public.user_profiles
 *   FOR SELECT USING (auth.uid() = id);
 * 
 * CREATE POLICY "Users can update their own profile" ON public.user_profiles
 *   FOR UPDATE USING (auth.uid() = id);
 * 
 * CREATE POLICY "Anyone can view public shared words" ON public.shared_words
 *   FOR SELECT USING (is_public = true);
 * 
 * CREATE POLICY "Users can create shared words" ON public.shared_words
 *   FOR INSERT WITH CHECK (auth.uid() = shared_by);
 */

// Helper functions for common database operations
export const dbHelpers = {
  // User profile operations
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Study group operations
  async createStudyGroup(groupData) {
    const { data, error } = await supabase
      .from('study_groups')
      .insert(groupData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async joinStudyGroup(groupId, userId, role = 'member') {
    const { data, error } = await supabase
      .from('group_members')
      .insert({ group_id: groupId, user_id: userId, role })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Shared word operations
  async shareWord(wordData) {
    const { data, error } = await supabase
      .from('shared_words')
      .insert(wordData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getSharedWords(filters = {}) {
    let query = supabase
      .from('shared_words')
      .select(`
        *,
        user_profiles!shared_by(username, avatar_url),
        word_comments(*)
      `);

    if (filters.groupId) {
      query = query.eq('shared_in', filters.groupId);
    }
    
    if (filters.isPublic) {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query.order('shared_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Notification operations
  async createNotification(notificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserNotifications(userId, unreadOnly = false) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Real-time subscriptions
  subscribeToGroup(groupId, callback) {
    return supabase
      .channel(`group-${groupId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'shared_words',
        filter: `shared_in=eq.${groupId}`
      }, callback)
      .subscribe();
  },

  subscribeToNotifications(userId, callback) {
    return supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
};

// Auth helpers
export const authHelpers = {
  async signUp(email, password, username) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        username,
        preferences: {
          theme: 'light',
          soundEffects: true,
          notifications: true,
          dailyGoal: 20
        },
        stats: {
          totalWords: 0,
          wordsLearned: 0,
          totalReviews: 0,
          averageAccuracy: 0,
          studyTime: 0
        }
      });

    if (profileError) throw profileError;
    return authData;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
};

export default supabase; 