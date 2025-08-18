import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, doc, getDoc, updateDoc, increment, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../../lib/firebase';
import { MessageSquare, Send, Loader2, Flag, Trash2 } from 'lucide-react';
import AuthModal from '../../auth/AuthModal';
import md5 from 'md5';
import { censorText } from '../../../utils/censor';
import { ADMIN_EMAILS } from '../../../utils/constants';

interface Comment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  content: string;
  createdAt: any;
  parentId?: string;
}

interface BusinessCommentsProps {
  businessId: string;
}

export default function BusinessComments({ businessId }: BusinessCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userCommentCount, setUserCommentCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to comments
    const commentsRef = collection(db, `businesses/${businessId}/comments`);
    const q = query(commentsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(commentsData);
    }, (error) => {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments. Please try again later.');
    });

    // Get user's comment count if authenticated
    if (auth.currentUser) {
      const fetchUserCommentCount = async () => {
        try {
          const statsRef = doc(db, 'users', auth.currentUser!.uid);
          const statsDoc = await getDoc(statsRef);
          if (statsDoc.exists()) {
            setUserCommentCount(statsDoc.data().totalComments || 0);
          }
        } catch (error) {
          console.error('Error fetching user comment count:', error);
        }
      };
      fetchUserCommentCount();
    }

    return () => unsubscribe();
  }, [businessId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (!newComment.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const commentsRef = collection(db, `businesses/${businessId}/comments`);
      const commentData = {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        userName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0],
        content: censorText(newComment.trim()),
        createdAt: new Date(),
        parentId: replyTo
      };

      await addDoc(commentsRef, commentData);

      // Update user's comment count
      const statsRef = doc(db, 'users', auth.currentUser.uid);
      try {
        await updateDoc(statsRef, {
          totalComments: increment(1)
        });
      } catch (updateError) {
        // If document doesn't exist, create it
        await setDoc(statsRef, { totalComments: 1 });
      }

      setNewComment('');
      setReplyTo(null);
      setUserCommentCount(prev => prev + 1);
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getGravatarUrl = (email: string) => {
    const hash = md5(email.toLowerCase().trim());
    return `https://www.gravatar.com/avatar/${hash}?d=mp&s=40`;
  };

  const handleReportAbuse = (comment: Comment) => {
    if (!auth.currentUser) {
      setShowAuthModal(true);
      return;
    }

    // Here you would typically open a modal or redirect to a report form
    // For now, we'll just show an alert
    alert('Thank you for reporting this comment. Our team will review it shortly.');
  };

  const handleDeleteComment = async (comment: Comment) => {
    if (!auth.currentUser) {
      setShowAuthModal(true);
      return;
    }

    // Check if user can delete this comment (owner or admin)
    const canDelete = comment.userId === auth.currentUser.uid || 
                     ADMIN_EMAILS.includes(auth.currentUser.email || '');

    if (!canDelete) {
      setError('You can only delete your own comments');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setDeletingCommentId(comment.id);
    setError(null);

    try {
      const commentRef = doc(db, `businesses/${businessId}/comments`, comment.id);
      await deleteDoc(commentRef);

      // Update user's comment count if it's their comment
      if (comment.userId === auth.currentUser.uid) {
        const statsRef = doc(db, 'users', auth.currentUser.uid);
        try {
          await updateDoc(statsRef, {
            totalComments: increment(-1)
          });
          setUserCommentCount(prev => Math.max(0, prev - 1));
        } catch (updateError) {
          console.error('Error updating comment count:', updateError);
        }
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment. Please try again.');
    } finally {
      setDeletingCommentId(null);
    }
  };
  const getThreadedComments = () => {
    const commentMap = new Map<string, Comment[]>();
    
    // Group comments by parent
    comments.forEach(comment => {
      const parentId = comment.parentId || 'root';
      if (!commentMap.has(parentId)) {
        commentMap.set(parentId, []);
      }
      commentMap.get(parentId)!.push(comment);
    });

    // Render comment thread
    const renderThread = (parentId: string = 'root', depth: number = 0) => {
      const threadComments = commentMap.get(parentId) || [];
      
      return threadComments.map(comment => (
        <div 
          key={comment.id} 
          className={`flex gap-4 ${depth > 0 ? 'ml-8 mt-4' : 'mt-6'}`}
        >
          <img
            src={getGravatarUrl(comment.userEmail)}
            alt={comment.userName}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <div className="bg-surface-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-surface-900">{comment.userName}</span>
                <span className="text-sm text-surface-500">
                  {new Date(comment.createdAt.toDate()).toLocaleDateString()}
                </span>
              </div>
              <p className="text-surface-700 whitespace-pre-line">{comment.content}</p>
            </div>
            <div className="flex items-center gap-4 mt-2">
              {depth < 2 && auth.currentUser && (
                <button
                  onClick={() => setReplyTo(comment.id)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Reply
                </button>
              )}
              {auth.currentUser && (comment.userId === auth.currentUser.uid || ADMIN_EMAILS.includes(auth.currentUser.email || '')) && (
                <button
                  onClick={() => handleDeleteComment(comment)}
                  disabled={deletingCommentId === comment.id}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  {deletingCommentId === comment.id ? 'Deleting...' : 'Delete'}
                </button>
              )}
              <button
                onClick={() => handleReportAbuse(comment)}
                className="text-sm text-surface-500 hover:text-red-600 flex items-center gap-1"
              >
                <Flag className="h-3 w-3" />
                Report abuse
              </button>
            </div>
            {commentMap.has(comment.id) && renderThread(comment.id, depth + 1)}
          </div>
        </div>
      ));
    };

    return renderThread();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-6 w-6 text-primary-600" />
        <h2 className="text-2xl font-semibold">Comments</h2>
        {auth.currentUser && (
          <span className="text-sm text-surface-500">
            ({userCommentCount} total comments)
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          {auth.currentUser && (
            <img
              src={getGravatarUrl(auth.currentUser.email || '')}
              alt="Your avatar"
              className="w-10 h-10 rounded-full"
            />
          )}
          <div className="flex-1">
            {replyTo && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-surface-600">
                  Replying to comment
                </span>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Cancel
                </button>
              </div>
            )}
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={auth.currentUser ? "Write a comment..." : "Sign in to comment"}
              className="w-full p-4 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={3}
              disabled={!auth.currentUser || loading}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!auth.currentUser || loading || !newComment.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Post Comment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-center text-surface-600 py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          getThreadedComments()
        )}
      </div>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}