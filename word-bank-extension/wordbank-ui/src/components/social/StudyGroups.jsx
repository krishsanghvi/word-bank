import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Crown, 
  Settings, 
  MessageCircle,
  TrendingUp,
  Calendar,
  Star,
  Globe,
  Lock,
  Copy,
  UserPlus,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { dbHelpers } from '../../lib/supabase';
import toast from 'react-hot-toast';
import './StudyGroups.css';

const StudyGroups = () => {
  const { user, userProfile } = useAuth();
  const [myGroups, setMyGroups] = useState([]);
  const [publicGroups, setPublicGroups] = useState([]);
  const [activeTab, setActiveTab] = useState('my-groups');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudyGroups();
  }, []);

  const loadStudyGroups = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockMyGroups = [
        {
          id: '1',
          name: 'Advanced English Vocabulary',
          description: 'Focus on advanced academic and professional vocabulary',
          memberCount: 24,
          role: 'owner',
          isPrivate: false,
          activity: 'active',
          lastActivity: Date.now() - 3600000, // 1 hour ago
          wordsShared: 156,
          weeklyGoal: 50,
          progress: 68,
          avatar: null,
          recentWords: ['serendipity', 'ubiquitous', 'paradigm']
        },
        {
          id: '2',
          name: 'Daily Word Challenge',
          description: 'Learn one new word every day with explanations and usage',
          memberCount: 89,
          role: 'admin',
          isPrivate: false,
          activity: 'very-active',
          lastActivity: Date.now() - 1800000, // 30 minutes ago
          wordsShared: 342,
          weeklyGoal: 35,
          progress: 92,
          avatar: null,
          recentWords: ['ephemeral', 'gregarious', 'lucid']
        },
        {
          id: '3',
          name: 'Medical Terminology',
          description: 'Essential medical and healthcare vocabulary',
          memberCount: 15,
          role: 'member',
          isPrivate: true,
          activity: 'moderate',
          lastActivity: Date.now() - 7200000, // 2 hours ago
          wordsShared: 89,
          weeklyGoal: 25,
          progress: 44,
          avatar: null,
          recentWords: ['auscultation', 'palpitation', 'dyspnea']
        }
      ];

      const mockPublicGroups = [
        {
          id: '4',
          name: 'IELTS Vocabulary Prep',
          description: 'Prepare for IELTS with essential vocabulary and practice',
          memberCount: 156,
          isPrivate: false,
          category: 'test-prep',
          activity: 'very-active',
          rating: 4.8,
          tags: ['IELTS', 'academic', 'exam-prep']
        },
        {
          id: '5',
          name: 'Business English Masters',
          description: 'Professional vocabulary for business communication',
          memberCount: 203,
          isPrivate: false,
          category: 'professional',
          activity: 'active',
          rating: 4.6,
          tags: ['business', 'professional', 'communication']
        },
        {
          id: '6',
          name: 'Literature Lovers',
          description: 'Explore rich vocabulary from classic and modern literature',
          memberCount: 78,
          isPrivate: false,
          category: 'literature',
          activity: 'moderate',
          rating: 4.9,
          tags: ['literature', 'reading', 'classics']
        }
      ];

      setMyGroups(mockMyGroups);
      setPublicGroups(mockPublicGroups);
    } catch (error) {
      console.error('Error loading study groups:', error);
      toast.error('Failed to load study groups');
    } finally {
      setLoading(false);
    }
  };

  const getActivityColor = (activity) => {
    switch (activity) {
      case 'very-active': return '#4caf50';
      case 'active': return '#2196f3';
      case 'moderate': return '#ff9800';
      case 'low': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getActivityText = (activity) => {
    switch (activity) {
      case 'very-active': return 'Very Active';
      case 'active': return 'Active';
      case 'moderate': return 'Moderate';
      case 'low': return 'Low Activity';
      default: return 'Unknown';
    }
  };

  const filteredGroups = (groups) => {
    return groups.filter(group => {
      const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           group.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || 
                           (filterType === 'private' && group.isPrivate) ||
                           (filterType === 'public' && !group.isPrivate) ||
                           (filterType === 'owned' && group.role === 'owner') ||
                           (filterType === 'admin' && (group.role === 'owner' || group.role === 'admin'));
      return matchesSearch && matchesFilter;
    });
  };

  return (
    <div className="study-groups">
      <div className="groups-header">
        <div className="header-content">
          <h1>
            <Users size={28} />
            Study Groups
          </h1>
          <p>Learn together with friends and the community</p>
        </div>
        <button
          className="create-group-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} />
          Create Group
        </button>
      </div>

      <div className="groups-controls">
        <div className="search-filter-row">
          <div className="search-wrapper">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-wrapper">
            <Filter size={18} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Groups</option>
              <option value="owned">My Groups</option>
              <option value="admin">Admin</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div className="groups-tabs">
          <button
            className={`tab-btn ${activeTab === 'my-groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-groups')}
          >
            My Groups ({myGroups.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            Discover Groups
          </button>
        </div>
      </div>

      <div className="groups-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading study groups...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'my-groups' ? (
              <motion.div
                key="my-groups"
                className="groups-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {filteredGroups(myGroups).length === 0 ? (
                  <div className="empty-state">
                    <Users size={48} />
                    <h3>No groups found</h3>
                    <p>Create your first study group or join an existing one</p>
                    <button
                      className="create-first-group-btn"
                      onClick={() => setShowCreateModal(true)}
                    >
                      <Plus size={20} />
                      Create Your First Group
                    </button>
                  </div>
                ) : (
                  filteredGroups(myGroups).map((group) => (
                    <MyGroupCard key={group.id} group={group} />
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div
                key="discover"
                className="groups-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {filteredGroups(publicGroups).map((group) => (
                  <PublicGroupCard key={group.id} group={group} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Create Group Modal would go here */}
    </div>
  );
};

const MyGroupCard = ({ group }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return <Crown size={16} />;
      case 'admin': return <Settings size={16} />;
      default: return null;
    }
  };

  const formatLastActivity = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <motion.div
      className="group-card my-group-card"
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="group-header">
        <div className="group-avatar">
          {group.avatar ? (
            <img src={group.avatar} alt={group.name} />
          ) : (
            <div className="avatar-placeholder">
              {group.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="group-info">
          <div className="group-title">
            <h3>{group.name}</h3>
            <div className="group-badges">
              {getRoleIcon(group.role)}
              {group.isPrivate ? <Lock size={14} /> : <Globe size={14} />}
            </div>
          </div>
          <p className="group-description">{group.description}</p>
        </div>
        <div className="group-menu">
          <button
            className="menu-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreHorizontal size={20} />
          </button>
          {showMenu && (
            <div className="menu-dropdown">
              <button>View Details</button>
              <button>Manage Members</button>
              <button>Group Settings</button>
              <button>Copy Invite Link</button>
            </div>
          )}
        </div>
      </div>

      <div className="group-stats">
        <div className="stat-item">
          <span className="stat-value">{group.memberCount}</span>
          <span className="stat-label">Members</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{group.wordsShared}</span>
          <span className="stat-label">Words</span>
        </div>
        <div className="stat-item">
          <span 
            className="stat-value activity-indicator"
            style={{ color: getActivityColor(group.activity) }}
          >
            ●
          </span>
          <span className="stat-label">{getActivityText(group.activity)}</span>
        </div>
      </div>

      <div className="group-progress">
        <div className="progress-header">
          <span>Weekly Progress</span>
          <span>{group.progress}% of {group.weeklyGoal} words</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${group.progress}%` }}
          />
        </div>
      </div>

      <div className="group-recent">
        <h4>Recent Words</h4>
        <div className="recent-words">
          {group.recentWords.map((word, index) => (
            <span key={index} className="recent-word">
              {word}
            </span>
          ))}
        </div>
      </div>

      <div className="group-footer">
        <span className="last-activity">
          Last activity: {formatLastActivity(group.lastActivity)}
        </span>
        <div className="group-actions">
          <button className="action-btn">
            <MessageCircle size={16} />
            Open
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const PublicGroupCard = ({ group }) => {
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinGroup = async () => {
    try {
      setIsJoining(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Joined ${group.name}!`);
    } catch (error) {
      toast.error('Failed to join group');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <motion.div
      className="group-card public-group-card"
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="group-header">
        <div className="group-info">
          <h3>{group.name}</h3>
          <p className="group-description">{group.description}</p>
        </div>
        <div className="group-rating">
          <Star size={16} />
          <span>{group.rating}</span>
        </div>
      </div>

      <div className="group-meta">
        <div className="meta-item">
          <Users size={16} />
          <span>{group.memberCount} members</span>
        </div>
        <div className="meta-item">
          <span 
            className="activity-dot"
            style={{ backgroundColor: getActivityColor(group.activity) }}
          />
          <span>{getActivityText(group.activity)}</span>
        </div>
      </div>

      <div className="group-tags">
        {group.tags.map((tag, index) => (
          <span key={index} className="tag">
            #{tag}
          </span>
        ))}
      </div>

      <div className="group-footer">
        <button
          className="join-btn"
          onClick={handleJoinGroup}
          disabled={isJoining}
        >
          {isJoining ? (
            <div className="loading-spinner small" />
          ) : (
            <>
              <UserPlus size={16} />
              Join Group
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default StudyGroups; 