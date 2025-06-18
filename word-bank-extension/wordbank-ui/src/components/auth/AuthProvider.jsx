import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, authHelpers, dbHelpers } from '../../lib/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        toast.error('Failed to load user session');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
          setIsAuthenticated(true);
          toast.success('Welcome back!');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
          setIsAuthenticated(false);
          toast.success('Signed out successfully');
        } else if (event === 'TOKEN_REFRESHED') {
          // Update user data on token refresh
          if (session?.user) {
            setUser(session.user);
          }
        }
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      const profile = await dbHelpers.getUserProfile(userId);
      setUserProfile(profile);
      
      // Update last active timestamp
      await dbHelpers.updateUserProfile(userId, {
        last_active: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
      // If profile doesn't exist, create a basic one
      if (error.code === 'PGRST116') {
        await createUserProfile(userId);
      }
    }
  };

  const createUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          username: user?.email?.split('@')[0] || 'user',
          preferences: {
            theme: 'light',
            soundEffects: true,
            notifications: true,
            dailyGoal: 20,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          stats: {
            totalWords: 0,
            wordsLearned: 0,
            totalReviews: 0,
            averageAccuracy: 0,
            studyTime: 0,
            wordsShared: 0,
            challengesWon: 0,
            helpfulVotes: 0
          }
        })
        .select()
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error creating user profile:', error);
      toast.error('Failed to create user profile');
    }
  };

  const signUp = async (email, password, username) => {
    try {
      setLoading(true);
      const data = await authHelpers.signUp(email, password, username);
      toast.success('Account created! Please check your email to verify.');
      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const data = await authHelpers.signIn(email, password);
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authHelpers.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user?.id) throw new Error('No user logged in');
      
      const updatedProfile = await dbHelpers.updateUserProfile(user.id, updates);
      setUserProfile(updatedProfile);
      toast.success('Profile updated successfully');
      return updatedProfile;
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const addXP = async (amount, reason = '') => {
    try {
      if (!userProfile) return;

      const newXP = (userProfile.total_xp || 0) + amount;
      const newLevel = calculateLevel(newXP);
      
      const updates = {
        total_xp: newXP,
        level: newLevel
      };

      // Check for level up
      if (newLevel > (userProfile.level || 1)) {
        toast.success(`🎉 Level Up! You're now level ${newLevel}!`, {
          duration: 4000,
          icon: '🎉'
        });
      } else if (amount > 0) {
        toast.success(`+${amount} XP${reason ? ` for ${reason}` : ''}`, {
          duration: 2000,
          icon: '⭐'
        });
      }

      await updateProfile(updates);
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  };

  const updateStreak = async (increment = true) => {
    try {
      if (!userProfile) return;

      const today = new Date().toDateString();
      const lastActive = userProfile.last_active ? 
        new Date(userProfile.last_active).toDateString() : null;

      let updates = {};

      if (increment && lastActive !== today) {
        const newStreak = (userProfile.current_streak || 0) + 1;
        updates = {
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, userProfile.longest_streak || 0)
        };

        // Streak milestone rewards
        if (newStreak === 7) {
          await addXP(100, 'week streak');
        } else if (newStreak === 30) {
          await addXP(500, 'month streak');
        } else if (newStreak % 10 === 0) {
          await addXP(50, `${newStreak}-day streak`);
        }
      } else if (!increment) {
        updates = { current_streak: 0 };
        if (userProfile.current_streak > 0) {
          toast.error('Streak lost! Start a new one today.', {
            duration: 3000,
            icon: '💔'
          });
        }
      }

      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const calculateLevel = (xp) => {
    // Level calculation: each level requires 1000 XP more than the previous
    // Level 1: 0-1000 XP, Level 2: 1000-3000 XP, Level 3: 3000-6000 XP, etc.
    if (xp < 1000) return 1;
    
    let level = 1;
    let requiredXP = 0;
    
    while (requiredXP <= xp) {
      level++;
      requiredXP += level * 1000;
    }
    
    return level - 1;
  };

  const getXPProgress = () => {
    if (!userProfile) return { current: 0, required: 1000, percentage: 0 };
    
    const currentXP = userProfile.total_xp || 0;
    const currentLevel = userProfile.level || 1;
    
    // Calculate XP needed for current level
    let levelStartXP = 0;
    for (let i = 1; i < currentLevel; i++) {
      levelStartXP += i * 1000;
    }
    
    const levelEndXP = levelStartXP + (currentLevel * 1000);
    const progressXP = currentXP - levelStartXP;
    const requiredXP = levelEndXP - levelStartXP;
    const percentage = (progressXP / requiredXP) * 100;
    
    return {
      current: progressXP,
      required: requiredXP,
      percentage: Math.min(100, Math.max(0, percentage))
    };
  };

  const checkDailyGoal = async () => {
    try {
      if (!userProfile) return false;
      
      const today = new Date().toDateString();
      const dailyGoal = userProfile.preferences?.dailyGoal || 20;
      
      // This would typically check against actual daily progress
      // For now, we'll use a placeholder implementation
      const todayProgress = 0; // TODO: Implement daily progress tracking
      
      if (todayProgress >= dailyGoal) {
        await addXP(100, 'daily goal');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking daily goal:', error);
      return false;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    updateProfile,
    addXP,
    updateStreak,
    calculateLevel,
    getXPProgress,
    checkDailyGoal
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 