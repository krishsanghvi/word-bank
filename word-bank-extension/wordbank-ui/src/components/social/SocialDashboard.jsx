import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Trophy, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  Bell,
  Star,
  Zap,
  Target,
  Award,
  BookOpen,
  Share2
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import StudyGroups from './StudyGroups';
import WordSharingModal from './WordSharingModal';
import { dbHelpers } from '../../lib/supabase';
import toast from 'react-hot-toast';
import './SocialDashboard.css';

const SocialDashboard = () => {
  const { user, userProfile, addXP } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [friendStats, setFriendStats] = useState({});
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [sharedWords, setSharedWords] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    try {
      setLoading(true);
      
      // Load notifications
      if (user) {
        const userNotifications = await dbHelpers.getUserNotifications(user.id);
        setNotifications(userNotifications.slice(0, 5)); // Show latest 5
      }

      // Mock data for demonstration
      setRecentActivity([
        {
          id: '1',
          type: 'word_shared',
          user: 'alex_learns',
          action: 'shared the word',
          target: 'serendipity',
          timestamp: Date.now() - 3600000,
          avatar: null
        },
        {
          id: '2',
          type: 'achievement',
          user: 'vocab_master',
          action: 'earned the achievement',
          target: 'Week Warrior',
          timestamp: Date.now() - 7200000,
          avatar: null
        },
        {
          id: '3',
          type: 'competition',
          user: 'word_ninja',
          action: 'won the competition',
          target: 'Daily Word Battle',
          timestamp: Date.now() - 10800000,
          avatar: null
        }
      ]);

      setFriendStats({
        totalFriends: 12,
        activeFriends: 8,
        studyGroups: 3,
        weeklyInteractions: 45
      });

      setDailyChallenge({
        title: 'Master 5 Advanced Words',
        description: 'Learn 5 words with difficulty level "hard" today',
        progress: 2,
        target: 5,
        reward: 100,
        timeLeft: '18h 32m'
      });

      setLeaderboard([
        { rank: 1, username: 'vocab_master', score: 2450, change: 0, avatar: null },
        { rank: 2, username: 'word_ninja', score: 2398, change: 1, avatar: null },
        { rank: 3, username: 'alex_learns', score: 2301, change: -1, avatar: null },
        { rank: 4, username: userProfile?.username || 'You', score: 2156, change: 2, avatar: null },
        { rank: 5, username: 'language_lover', score: 2089, change: -1, avatar: null }
      ]);

      setSharedWords([
        {
          id: '1',
          word: 'ephemeral',
          definition: 'Lasting for a very short time',
          sharedBy: 'alex_learns',
          likes: 15,
          comments: 3,
          timestamp: Date.now() - 1800000
        },
        {
          id: '2',
          word: 'ubiquitous',
          definition: 'Present, appearing, or found everywhere',
          sharedBy: 'vocab_master',
          likes: 23,
          comments: 7,
          timestamp: Date.now() - 3600000
        }
      ]);

    } catch (error) {
      console.error('Error loading social data:', error);
      toast.error('Failed to load social features');
    } finally {
      setLoading(false);
    }
  };

  const handleShareWord = (word) => {
    setSelectedWord(word);
    setShowShareModal(true);
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'word_shared': return <Share2 size={16} />;
      case 'achievement': return <Award size={16} />;
      case 'competition': return <Trophy size={16} />;
      default: return <Star size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="social-dashboard loading">
        <div className="loading-spinner" />
        <p>Loading social features...</p>
      </div>
    );
  }

  return (
    <div className="social-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>
            <Users size={28} />
            Social Learning
          </h1>
          <p>Connect, compete, and learn together</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <Zap size={20} />
            <div>
              <span className="stat-value">{userProfile?.total_xp || 0}</span>
              <span className="stat-label">Total XP</span>
            </div>
          </div>
          <div className="stat-card">
            <Target size={20} />
            <div>
              <span className="stat-value">{userProfile?.current_streak || 0}</span>
              <span className="stat-label">Day Streak</span>
            </div>
          </div>
          <div className="stat-card">
            <Trophy size={20} />
            <div>
              <span className="stat-value">{userProfile?.level || 1}</span>
              <span className="stat-label">Level</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <TrendingUp size={20} />
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          <Users size={20} />
          Study Groups
        </button>
        <button
          className={`tab-btn ${activeTab === 'competitions' ? 'active' : ''}`}
          onClick={() => setActiveTab('competitions')}
        >
          <Trophy size={20} />
          Competitions
        </button>
        <button
          className={`tab-btn ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          <MessageSquare size={20} />
          Community
        </button>
      </div>

      <div className="dashboard-content">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              className="overview-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="overview-grid">
                {/* Daily Challenge */}
                {dailyChallenge && (
                  <div className="challenge-card">
                    <div className="challenge-header">
                      <h3>
                        <Calendar size={20} />
                        Daily Challenge
                      </h3>
                      <span className="time-left">{dailyChallenge.timeLeft}</span>
                    </div>
                    <div className="challenge-content">
                      <h4>{dailyChallenge.title}</h4>
                      <p>{dailyChallenge.description}</p>
                      <div className="challenge-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${(dailyChallenge.progress / dailyChallenge.target) * 100}%` }}
                          />
                        </div>
                        <span>{dailyChallenge.progress}/{dailyChallenge.target}</span>
                      </div>
                      <div className="challenge-reward">
                        <Zap size={16} />
                        <span>{dailyChallenge.reward} XP reward</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Friend Stats */}
                <div className="stats-card">
                  <h3>
                    <Users size={20} />
                    Social Stats
                  </h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-number">{friendStats.totalFriends}</span>
                      <span className="stat-label">Friends</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{friendStats.activeFriends}</span>
                      <span className="stat-label">Active</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{friendStats.studyGroups}</span>
                      <span className="stat-label">Groups</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{friendStats.weeklyInteractions}</span>
                      <span className="stat-label">Interactions</span>
                    </div>
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="leaderboard-card">
                  <h3>
                    <Trophy size={20} />
                    Weekly Leaderboard
                  </h3>
                  <div className="leaderboard-list">
                    {leaderboard.map((entry, index) => (
                      <div key={entry.rank} className="leaderboard-item">
                        <div className="rank">
                          {entry.rank <= 3 ? (
                            <div className={`medal medal-${entry.rank}`}>
                              {entry.rank}
                            </div>
                          ) : (
                            <span>{entry.rank}</span>
                          )}
                        </div>
                        <div className="user-info">
                          <div className="avatar">
                            {entry.avatar ? (
                              <img src={entry.avatar} alt={entry.username} />
                            ) : (
                              <div className="avatar-placeholder">
                                {entry.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="username">{entry.username}</span>
                        </div>
                        <div className="score">{entry.score}</div>
                        <div className="change">
                          {entry.change > 0 && <span className="up">↗</span>}
                          {entry.change < 0 && <span className="down">↘</span>}
                          {entry.change === 0 && <span className="same">━</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="activity-card">
                  <h3>
                    <Bell size={20} />
                    Recent Activity
                  </h3>
                  <div className="activity-list">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="activity-item">
                        <div className="activity-icon">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="activity-content">
                          <p>
                            <strong>{activity.user}</strong> {activity.action}{' '}
                            <em>"{activity.target}"</em>
                          </p>
                          <span className="activity-time">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shared Words */}
                <div className="shared-words-card">
                  <h3>
                    <BookOpen size={20} />
                    Community Words
                  </h3>
                  <div className="shared-words-list">
                    {sharedWords.map((item) => (
                      <div key={item.id} className="shared-word-item">
                        <div className="word-content">
                          <h4>{item.word}</h4>
                          <p>{item.definition}</p>
                          <div className="word-meta">
                            <span>by {item.sharedBy}</span>
                            <span>{formatTimeAgo(item.timestamp)}</span>
                          </div>
                        </div>
                        <div className="word-actions">
                          <button className="like-btn">
                            <Star size={16} />
                            {item.likes}
                          </button>
                          <button className="comment-btn">
                            <MessageSquare size={16} />
                            {item.comments}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'groups' && (
            <motion.div
              key="groups"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StudyGroups />
            </motion.div>
          )}

          {activeTab === 'competitions' && (
            <motion.div
              key="competitions"
              className="competitions-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="coming-soon">
                <Trophy size={64} />
                <h2>Competitions Coming Soon!</h2>
                <p>Get ready for exciting vocabulary battles, tournaments, and challenges.</p>
                <div className="features-preview">
                  <div className="feature-item">
                    <Zap size={24} />
                    <span>Real-time Word Battles</span>
                  </div>
                  <div className="feature-item">
                    <Trophy size={24} />
                    <span>Weekly Tournaments</span>
                  </div>
                  <div className="feature-item">
                    <Award size={24} />
                    <span>Achievement Badges</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'community' && (
            <motion.div
              key="community"
              className="community-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="coming-soon">
                <MessageSquare size={64} />
                <h2>Community Forums Coming Soon!</h2>
                <p>Connect with fellow learners, discuss words, and share learning tips.</p>
                <div className="features-preview">
                  <div className="feature-item">
                    <MessageSquare size={24} />
                    <span>Discussion Forums</span>
                  </div>
                  <div className="feature-item">
                    <Star size={24} />
                    <span>Word of the Day</span>
                  </div>
                  <div className="feature-item">
                    <Users size={24} />
                    <span>Expert Contributors</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Word Sharing Modal */}
      <WordSharingModal
        word={selectedWord}
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setSelectedWord(null);
        }}
      />
    </div>
  );
};

export default SocialDashboard; 