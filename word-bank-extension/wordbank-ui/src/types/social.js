/**
 * Social Learning Platform Type Definitions
 * Comprehensive types for community features, competitions, and social interactions
 */

/**
 * @typedef {Object} User
 * @property {string} id - Unique user identifier
 * @property {string} username - Display name
 * @property {string} email - User email
 * @property {string} avatar - Avatar URL
 * @property {number} level - User level based on XP
 * @property {number} totalXP - Total experience points
 * @property {number} currentStreak - Current learning streak
 * @property {number} longestStreak - Longest streak achieved
 * @property {string[]} badges - Earned achievement badges
 * @property {UserPreferences} preferences - User settings
 * @property {UserStats} stats - Learning statistics
 * @property {number} createdAt - Account creation timestamp
 * @property {number} lastActive - Last activity timestamp
 */

/**
 * @typedef {Object} UserPreferences
 * @property {string} theme - UI theme preference
 * @property {boolean} soundEffects - Sound effects enabled
 * @property {boolean} notifications - Push notifications enabled
 * @property {string} timezone - User timezone
 * @property {number} dailyGoal - Daily learning goal
 * @property {string[]} languages - Target languages
 * @property {'beginner' | 'intermediate' | 'advanced'} level - Skill level
 */

/**
 * @typedef {Object} UserStats
 * @property {number} totalWords - Total words in vocabulary
 * @property {number} wordsLearned - Words with mastery > 70%
 * @property {number} totalReviews - Total review sessions completed
 * @property {number} averageAccuracy - Overall accuracy percentage
 * @property {number} studyTime - Total time spent studying (minutes)
 * @property {number} wordsShared - Words shared with community
 * @property {number} challengesWon - Competitions won
 * @property {number} helpfulVotes - Helpful votes received
 */

/**
 * @typedef {Object} StudyGroup
 * @property {string} id - Unique group identifier
 * @property {string} name - Group name
 * @property {string} description - Group description
 * @property {string} ownerId - Group creator ID
 * @property {GroupMember[]} members - Group members
 * @property {SharedWord[]} sharedWords - Group vocabulary
 * @property {GroupChallenge[]} challenges - Active challenges
 * @property {boolean} isPrivate - Whether group is private
 * @property {string} inviteCode - Invitation code for joining
 * @property {number} createdAt - Group creation timestamp
 * @property {GroupSettings} settings - Group configuration
 */

/**
 * @typedef {Object} GroupMember
 * @property {string} userId - User ID
 * @property {string} username - User display name
 * @property {'owner' | 'admin' | 'member'} role - Member role
 * @property {number} joinedAt - Join timestamp
 * @property {number} contribution - Words contributed to group
 * @property {boolean} isActive - Whether member is currently active
 */

/**
 * @typedef {Object} GroupSettings
 * @property {boolean} allowMemberInvites - Members can invite others
 * @property {boolean} autoApproveJoins - Auto-approve join requests
 * @property {number} maxMembers - Maximum group size
 * @property {string[]} allowedLanguages - Permitted languages
 * @property {boolean} enableCompetitions - Allow group competitions
 */

/**
 * @typedef {Object} SharedWord
 * @property {string} id - Unique share identifier
 * @property {string} word - The word itself
 * @property {WordDefinition[]} definitions - Word definitions
 * @property {string} category - Word category
 * @property {string} sharedBy - User who shared the word
 * @property {string} sharedIn - Group/user ID where shared
 * @property {string} note - Personal note about the word
 * @property {string[]} tags - User-defined tags
 * @property {number} likes - Number of likes received
 * @property {string[]} likedBy - Users who liked this word
 * @property {WordComment[]} comments - Comments on the word
 * @property {number} sharedAt - Share timestamp
 * @property {boolean} isPublic - Publicly visible
 */

/**
 * @typedef {Object} WordComment
 * @property {string} id - Comment ID
 * @property {string} userId - Commenter ID
 * @property {string} username - Commenter name
 * @property {string} content - Comment text
 * @property {number} likes - Comment likes
 * @property {string[]} likedBy - Users who liked comment
 * @property {string} parentId - Parent comment ID (for replies)
 * @property {number} createdAt - Comment timestamp
 * @property {boolean} isEdited - Whether comment was edited
 */

/**
 * @typedef {Object} WordOfTheDay
 * @property {string} id - Unique identifier
 * @property {string} word - Featured word
 * @property {WordDefinition[]} definitions - Word definitions
 * @property {string} etymology - Word origin story
 * @property {string} funFact - Interesting fact about the word
 * @property {string} submittedBy - User who submitted
 * @property {number} votes - Votes received for featuring
 * @property {string[]} votedBy - Users who voted
 * @property {number} featuredDate - When word was featured
 * @property {WordComment[]} discussions - Community discussions
 */

/**
 * @typedef {Object} Competition
 * @property {string} id - Competition ID
 * @property {string} title - Competition title
 * @property {string} description - Competition description
 * @property {'word_battle' | 'speed_round' | 'team_challenge' | 'tournament'} type
 * @property {'active' | 'pending' | 'completed' | 'cancelled'} status
 * @property {CompetitionSettings} settings - Competition configuration
 * @property {Participant[]} participants - Competition participants
 * @property {CompetitionRound[]} rounds - Competition rounds
 * @property {Prize[]} prizes - Competition rewards
 * @property {number} startTime - Competition start time
 * @property {number} endTime - Competition end time
 * @property {string} createdBy - Competition creator
 */

/**
 * @typedef {Object} CompetitionSettings
 * @property {number} maxParticipants - Maximum participants
 * @property {number} roundDuration - Round time limit (seconds)
 * @property {number} questionsPerRound - Questions per round
 * @property {'easy' | 'medium' | 'hard' | 'mixed'} difficulty
 * @property {string[]} categories - Word categories included
 * @property {boolean} allowTeams - Team participation allowed
 * @property {number} teamSize - Maximum team size
 */

/**
 * @typedef {Object} Participant
 * @property {string} userId - Participant user ID
 * @property {string} username - Display name
 * @property {string} teamId - Team ID (if team competition)
 * @property {number} score - Current score
 * @property {number} rank - Current ranking
 * @property {ParticipantStats} stats - Competition statistics
 * @property {boolean} isActive - Currently participating
 */

/**
 * @typedef {Object} ParticipantStats
 * @property {number} correctAnswers - Correct answers given
 * @property {number} totalAnswers - Total answers attempted
 * @property {number} averageResponseTime - Average response time
 * @property {number} longestStreak - Longest correct streak
 * @property {number} pointsEarned - Total points earned
 */

/**
 * @typedef {Object} CompetitionRound
 * @property {string} id - Round ID
 * @property {number} roundNumber - Round sequence number
 * @property {Question[]} questions - Round questions
 * @property {RoundResult[]} results - Round results
 * @property {number} startTime - Round start time
 * @property {number} endTime - Round end time
 * @property {'pending' | 'active' | 'completed'} status
 */

/**
 * @typedef {Object} Question
 * @property {string} id - Question ID
 * @property {'multiple_choice' | 'true_false' | 'fill_blank' | 'definition'} type
 * @property {string} word - Target word
 * @property {string} question - Question text
 * @property {string[]} options - Answer options
 * @property {string} correctAnswer - Correct answer
 * @property {number} timeLimit - Time limit for question
 * @property {number} points - Points for correct answer
 */

/**
 * @typedef {Object} RoundResult
 * @property {string} userId - Participant ID
 * @property {number} score - Round score
 * @property {number} time - Time taken
 * @property {QuestionResult[]} answers - Individual answers
 */

/**
 * @typedef {Object} QuestionResult
 * @property {string} questionId - Question ID
 * @property {string} userAnswer - User's answer
 * @property {boolean} isCorrect - Whether answer was correct
 * @property {number} responseTime - Time taken to answer
 * @property {number} pointsEarned - Points earned
 */

/**
 * @typedef {Object} Leaderboard
 * @property {string} id - Leaderboard ID
 * @property {string} title - Leaderboard title
 * @property {'daily' | 'weekly' | 'monthly' | 'alltime'} period
 * @property {'words_learned' | 'accuracy' | 'streak' | 'xp' | 'competitions'} metric
 * @property {LeaderboardEntry[]} entries - Leaderboard entries
 * @property {number} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} LeaderboardEntry
 * @property {number} rank - Current rank
 * @property {string} userId - User ID
 * @property {string} username - Display name
 * @property {string} avatar - User avatar
 * @property {number} value - Metric value
 * @property {number} change - Rank change from previous period
 * @property {string[]} badges - Displayed badges
 */

/**
 * @typedef {Object} ForumThread
 * @property {string} id - Thread ID
 * @property {string} title - Thread title
 * @property {string} content - Thread content
 * @property {string} authorId - Thread author
 * @property {string} authorName - Author display name
 * @property {string} category - Thread category
 * @property {string[]} tags - Thread tags
 * @property {boolean} isPinned - Whether thread is pinned
 * @property {boolean} isLocked - Whether thread is locked
 * @property {number} views - View count
 * @property {number} replies - Reply count
 * @property {number} likes - Like count
 * @property {string[]} likedBy - Users who liked
 * @property {ForumPost[]} posts - Thread posts
 * @property {number} createdAt - Creation timestamp
 * @property {number} lastActivity - Last activity timestamp
 */

/**
 * @typedef {Object} ForumPost
 * @property {string} id - Post ID
 * @property {string} threadId - Parent thread ID
 * @property {string} authorId - Post author
 * @property {string} authorName - Author display name
 * @property {string} content - Post content
 * @property {number} likes - Like count
 * @property {string[]} likedBy - Users who liked
 * @property {string} parentPostId - Parent post (for replies)
 * @property {number} createdAt - Creation timestamp
 * @property {boolean} isEdited - Whether post was edited
 * @property {boolean} isDeleted - Whether post was deleted
 */

/**
 * @typedef {Object} Notification
 * @property {string} id - Notification ID
 * @property {string} userId - Target user ID
 * @property {'word_shared' | 'challenge_invite' | 'competition_result' | 'forum_reply' | 'achievement'} type
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {Object} data - Additional notification data
 * @property {boolean} isRead - Whether notification was read
 * @property {number} createdAt - Creation timestamp
 * @property {string} actionUrl - URL for notification action
 */

/**
 * @typedef {Object} Achievement
 * @property {string} id - Achievement ID
 * @property {string} title - Achievement title
 * @property {string} description - Achievement description
 * @property {string} icon - Achievement icon
 * @property {'bronze' | 'silver' | 'gold' | 'platinum'} tier
 * @property {number} xpReward - XP points rewarded
 * @property {AchievementCriteria} criteria - Unlock criteria
 * @property {boolean} isSecret - Whether achievement is hidden
 * @property {number} unlockedBy - Number of users who unlocked
 */

/**
 * @typedef {Object} AchievementCriteria
 * @property {string} metric - Metric to track
 * @property {number} target - Target value
 * @property {string} timeframe - Time constraint
 * @property {Object} conditions - Additional conditions
 */

export {}; 