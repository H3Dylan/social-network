'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    name: string | null;
    image: string | null;
}

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: User;
}

export default function CommentSection({ mediaId, initialComments }: { mediaId: string, initialComments: Comment[] }) {
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
                const comment = await res.json();
                setComments([comment, ...comments]);
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
                    <div key={comment.id} className="comment">
                        <div className="comment-header">
                            <span className="author">{comment.user.name || "Anonymous"}</span>
                            <span className="date">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p>{comment.content}</p>
                    </div>
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
            `}</style>
        </div>
    );
}
