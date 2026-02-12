'use client';

import { formatDistanceToNow } from 'date-fns';
import { useReactions, Reaction } from '@/hooks/useReactions';
import { ReactionAction, ReactionSummary } from './EmojiReactionButton';

interface CommentItemProps {
    comment: {
        id: string;
        content: string;
        createdAt: string;
        user: {
            id: string;
            name: string | null;
            image: string | null;
        };
        reactions: Reaction[];
    };
    currentUserId?: string;
}

export default function CommentItem({ comment, currentUserId }: CommentItemProps) {
    const { reactions, toggleReaction } = useReactions(
        comment.reactions,
        comment.id,
        'comment',
        currentUserId
    );

    return (
        <div className="comment">
            <div className="comment-header">
                <span className="author">{comment.user.name || "Anonymous"}</span>
                <span className="date">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
            </div>
            <p className="comment-text">{comment.content}</p>

            <div className="comment-footer">
                <div className="comment-actions">
                    <ReactionAction
                        reactions={reactions}
                        currentUserId={currentUserId}
                        onReact={toggleReaction}
                    />
                </div>
                <div className="comment-reactions">
                    <ReactionSummary reactions={reactions} />
                </div>
            </div>

            <style jsx>{`
                .comment {
                    padding: 0.75rem;
                    border-bottom: 1px solid var(--border);
                }
                .comment:last-child {
                    border-bottom: none;
                }
                .comment-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.25rem;
                    font-size: 0.85rem;
                }
                .author {
                    font-weight: 600;
                    color: var(--foreground);
                }
                .date {
                    color: var(--text-secondary);
                }
                .comment-text {
                    margin-bottom: 0.5rem;
                    color: var(--text-primary);
                    line-height: 1.4;
                }
                .comment-footer {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .comment-actions {
                    /* Scale down the button slightly for comments if needed */
                    transform: scale(0.8);
                    transform-origin: left center;
                }
                .comment-reactions {
                    /* Scale down summary too? */
                }
            `}</style>
        </div>
    );
}
