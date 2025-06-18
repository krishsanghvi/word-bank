import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Users, 
  Globe, 
  Link, 
  MessageCircle, 
  X, 
  Copy, 
  Check,
  Facebook,
  Twitter,
  Send,
  UserPlus
} from 'lucide-react';
import { 
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailShareButton,
  WhatsappIcon,
  EmailIcon
} from 'react-share';
import { useAuth } from '../auth/AuthProvider';
import { dbHelpers } from '../../lib/supabase';
import toast from 'react-hot-toast';
import './WordSharingModal.css';

const WordSharingModal = ({ word, isOpen, onClose }) => {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');
  const [shareNote, setShareNote] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [studyGroups, setStudyGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && word) {
      loadSharingData();
      generateShareLink();
    }
  }, [isOpen, word]);

  const loadSharingData = async () => {
    try {
      // Load user's study groups
      // This would typically fetch from your database
      const mockGroups = [
        { id: '1', name: 'English Vocabulary Club', members: 45 },
        { id: '2', name: 'Advanced Learners', members: 23 },
        { id: '3', name: 'Daily Word Challenge', members: 89 }
      ];
      setStudyGroups(mockGroups);

      // Load user's friends
      const mockFriends = [
        { id: '1', username: 'alex_learns', avatar: null, isOnline: true },
        { id: '2', username: 'vocab_master', avatar: null, isOnline: false },
        { id: '3', username: 'word_ninja', avatar: null, isOnline: true }
      ];
      setFriends(mockFriends);
    } catch (error) {
      console.error('Error loading sharing data:', error);
    }
  };

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/shared-word/${word.word}?ref=${user?.id}`;
    setShareLink(link);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleShareWord = async () => {
    try {
      setLoading(true);

      const shareData = {
        word: word.word,
        definitions: word.definitions,
        category: word.category,
        shared_by: user.id,
        note: shareNote,
        is_public: isPublic,
        tags: word.tags || []
      };

      // Share to selected groups
      for (const groupId of selectedGroups) {
        await dbHelpers.shareWord({
          ...shareData,
          shared_in: groupId,
          is_public: false
        });
      }

      // Share to selected friends
      for (const friendId of selectedFriends) {
        await dbHelpers.shareWord({
          ...shareData,
          shared_in: friendId,
          is_public: false
        });

        // Create notification for friend
        await dbHelpers.createNotification({
          user_id: friendId,
          type: 'word_shared',
          title: `${userProfile?.username} shared a word with you!`,
          message: `Check out the word "${word.word}"`,
          data: { word: word.word, sharedBy: userProfile?.username },
          action_url: `/shared-words`
        });
      }

      // Share publicly if selected
      if (isPublic) {
        await dbHelpers.shareWord({
          ...shareData,
          shared_in: null,
          is_public: true
        });
      }

      toast.success('Word shared successfully! 🎉');
      onClose();
    } catch (error) {
      console.error('Error sharing word:', error);
      toast.error('Failed to share word');
    } finally {
      setLoading(false);
    }
  };

  const shareText = `Check out this word I'm learning: "${word?.word}" - ${word?.definitions?.[0]?.definition}`;
  const shareUrl = shareLink;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="word-sharing-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>
              <Share2 size={24} />
              Share "{word?.word}"
            </h2>
            <button className="close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="modal-content">
            <div className="word-preview">
              <div className="word-display">
                <h3>{word?.word}</h3>
                <p>{word?.definitions?.[0]?.definition}</p>
              </div>
              <span className="category-badge">
                {word?.category || 'unknown'}
              </span>
            </div>

            <div className="sharing-tabs">
              <button
                className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
                onClick={() => setActiveTab('friends')}
              >
                <Users size={20} />
                Friends & Groups
              </button>
              <button
                className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
                onClick={() => setActiveTab('social')}
              >
                <Globe size={20} />
                Social Media
              </button>
              <button
                className={`tab-btn ${activeTab === 'link' ? 'active' : ''}`}
                onClick={() => setActiveTab('link')}
              >
                <Link size={20} />
                Share Link
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'friends' && (
                <motion.div
                  className="friends-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="share-note">
                    <label htmlFor="shareNote">Add a note (optional)</label>
                    <textarea
                      id="shareNote"
                      placeholder="Why is this word interesting? Add context for your friends..."
                      value={shareNote}
                      onChange={(e) => setShareNote(e.target.value)}
                      maxLength={280}
                    />
                    <div className="char-count">{shareNote.length}/280</div>
                  </div>

                  <div className="sharing-options">
                    <div className="option-group">
                      <h4>
                        <Users size={18} />
                        Study Groups
                      </h4>
                      <div className="group-list">
                        {studyGroups.map((group) => (
                          <label key={group.id} className="group-item">
                            <input
                              type="checkbox"
                              checked={selectedGroups.includes(group.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedGroups([...selectedGroups, group.id]);
                                } else {
                                  setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                                }
                              }}
                            />
                            <div className="group-info">
                              <span className="group-name">{group.name}</span>
                              <span className="group-members">{group.members} members</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="option-group">
                      <h4>
                        <UserPlus size={18} />
                        Friends
                      </h4>
                      <div className="friends-list">
                        {friends.map((friend) => (
                          <label key={friend.id} className="friend-item">
                            <input
                              type="checkbox"
                              checked={selectedFriends.includes(friend.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFriends([...selectedFriends, friend.id]);
                                } else {
                                  setSelectedFriends(selectedFriends.filter(id => id !== friend.id));
                                }
                              }}
                            />
                            <div className="friend-info">
                              <div className="friend-avatar">
                                {friend.avatar ? (
                                  <img src={friend.avatar} alt={friend.username} />
                                ) : (
                                  <div className="avatar-placeholder">
                                    {friend.username.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                {friend.isOnline && <div className="online-indicator" />}
                              </div>
                              <span className="friend-name">{friend.username}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="public-sharing">
                      <label className="public-option">
                        <input
                          type="checkbox"
                          checked={isPublic}
                          onChange={(e) => setIsPublic(e.target.checked)}
                        />
                        <div className="public-info">
                          <span className="public-label">
                            <Globe size={16} />
                            Share publicly
                          </span>
                          <span className="public-desc">
                            Make this word discoverable by the entire community
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'social' && (
                <motion.div
                  className="social-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="social-buttons">
                    <TwitterShareButton
                      url={shareUrl}
                      title={shareText}
                      hashtags={['vocabulary', 'learning', 'wordbank']}
                      className="social-share-btn twitter"
                    >
                      <Twitter size={20} />
                      <span>Share on Twitter</span>
                    </TwitterShareButton>

                    <FacebookShareButton
                      url={shareUrl}
                      quote={shareText}
                      className="social-share-btn facebook"
                    >
                      <Facebook size={20} />
                      <span>Share on Facebook</span>
                    </FacebookShareButton>

                    <WhatsappShareButton
                      url={shareUrl}
                      title={shareText}
                      className="social-share-btn whatsapp"
                    >
                      <WhatsappIcon size={20} round />
                      <span>Share on WhatsApp</span>
                    </WhatsappShareButton>

                    <EmailShareButton
                      url={shareUrl}
                      subject={`Check out this word: ${word?.word}`}
                      body={shareText}
                      className="social-share-btn email"
                    >
                      <EmailIcon size={20} round />
                      <span>Share via Email</span>
                    </EmailShareButton>
                  </div>
                </motion.div>
              )}

              {activeTab === 'link' && (
                <motion.div
                  className="link-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="share-link-section">
                    <p>Share this link with anyone to let them discover this word:</p>
                    <div className="link-input-wrapper">
                      <input
                        type="text"
                        value={shareLink}
                        readOnly
                        className="link-input"
                      />
                      <button
                        className="copy-btn"
                        onClick={handleCopyLink}
                      >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="link-features">
                      <h4>When someone clicks this link, they'll see:</h4>
                      <ul>
                        <li>The word and its definition</li>
                        <li>Who shared it with them</li>
                        <li>Option to add it to their own word bank</li>
                        <li>Related words and learning resources</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            {activeTab === 'friends' && (
              <button
                className="share-btn"
                onClick={handleShareWord}
                disabled={loading || (selectedGroups.length === 0 && selectedFriends.length === 0 && !isPublic)}
              >
                {loading ? (
                  <div className="loading-spinner" />
                ) : (
                  <>
                    <Send size={20} />
                    Share Word
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WordSharingModal; 