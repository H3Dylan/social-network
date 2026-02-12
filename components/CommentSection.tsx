'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CommentItem from './CommentItem';

interface User {
    id: string;
    name: string | null;
    image: string | null;
}

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: User;
    reactions: Array<{
        emoji: string;
        userId: string;
    }>;
}

interface CommentSectionProps {
    mediaId: string;
    initialComments: Comment[];
    currentUserId?: string;
}

export default function CommentSection({ mediaId, initialComments, currentUserId }: CommentSectionProps) {
    const router = useRouter();
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsPosting(true);
        try {
            const res = await fetch(`/api/media/${mediaId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment })
            });

            if (res.ok) {
                // The API currently returns the created comment.
                // We might need to fetch the fresh comment with reactions (empty) to match types.
                // Or just manually construct it.
                const createdComment = await res.json();
                const commentWithReactions: Comment = {
                    ...createdComment,
                    user: {
                        id: currentUserId || '', // fallback
                        name: createdComment.user?.name || 'You', // dependent on API return
                        image: createdComment.user?.image
                    },
                    reactions: []
                };

                // Ideally API should return the user object properly. 
                // Assuming existing API returns standard Prisma structure including user relation?
                // I'll check the API later if needed, but standard create with include user works.

                setComments([commentWithReactions, ...comments]);
                setNewComment('');
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="comments-section">
            <h3>Comments</h3>

            <form onSubmit={handleSubmit} className="comment-form">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="input"
                    disabled={isPosting}
                />
                <button type="submit" className="btn btn-secondary" disabled={isPosting || !newComment.trim()}>
                    Post
                </button>
            </form>

            <div className="comments-list">
                {comments.map(comment => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        currentUserId={currentUserId}
                    />
                ))}
            </div>

            <style jsx>{`
                .comments-section {
                    margin-top: var(--spacing-6);
                    padding-top: var(--spacing-6);
                    border-top: 1px solid var(--border);
                }
                
                .comment-form {
                    display: flex;
                    gap: var(--spacing-2);
                    margin-bottom: var(--spacing-6);
                }

                .input {
                    flex: 1;
                    padding: 0.5rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                    background: var(--surface);
                    color: var(--foreground);
                }

                .comments-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-4);
                }

                .comment {
                    padding: var(--spacing-4);
                    background: var(--surface);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                }

                .comment-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: var(--spacing-1);
                    font-size: 0.875rem;
                }

                .author {
                    font-weight: 600;
                    color: var(--primary);
                }

                .date {
                    color: #94a3b8;
                }
                
                .comment-actions {
                    margin-top: 0.5rem;
                    display: flex;
                    justify-content: flex-end;
                }
            `}</style>
        </div>
    );
}
