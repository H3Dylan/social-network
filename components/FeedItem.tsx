'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useReactions } from '@/hooks/useReactions';
import { useHoverPicker } from '@/hooks/useHoverPicker';
import { ReactionSummary } from './EmojiReactionButton';
import { createPortal } from 'react-dom';
import EmojiPicker from './EmojiPicker';

interface FeedItemProps {
    media: {
        id: string;
        url: string;
        type: string;
        createdAt: Date;
        user: {
            id: string;
            name: string | null;
            image: string | null;
        };
        group: {
            id: string;
            name: string;
        };
        album: {
            id: string;
            title: string;
        };
        _count: {
            reactions: number;
            comments: number;
        };
        reactions: Array<{
            userId: string;
            emoji: string;
            user: { name: string | null };
        }>;
    };
    currentUserId?: string;
}

export default function FeedItem({ media, currentUserId }: FeedItemProps) {
    const { reactions, toggleReaction } = useReactions(
        media.reactions,
        media.id,
        'media',
        currentUserId
    );

    const {
        showHoverPicker,
        pickerPosition,
        triggerRef,
        handleMouseEnter,
        handleMouseLeave,
        onPickerEnter,
        onPickerLeave
    } = useHoverPicker();

    return (
        <div
            className="feed-item"
            ref={triggerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="feed-header">
                <div className="author-info">
                    <div className="avatar-placeholder">
                        {media.user.name?.[0] || '?'}
                    </div>
                    <div className="meta">
                        <span className="author-name">{media.user.name || 'Unknown User'}</span>
                        <div className="context-info">
                            <span>in </span>
                            <Link href={`/groups/${media.group.id}`} className="group-link">
                                {media.group.name}
                            </Link>
                            <span> • </span>
                            <span className="timestamp">
                                {formatDistanceToNow(new Date(media.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <Link href={`/groups/${media.group.id}/albums/${media.album.id}/media/${media.id}`} className="media-content-link">
                {media.type === 'VIDEO' ? (
                    <div className="video-container">
                        <video src={media.url} className="media-content" preload="metadata" controls />
                    </div>
                ) : (
                    <div className="image-container">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={media.url}
                            alt={`Posted by ${media.user.name}`}
                            className="feed-image"
                        />
                    </div>
                )}
            </Link>

            {/* Reaction Summary attached below media */}
            <div className="reaction-summary-bar">
                <ReactionSummary reactions={reactions} currentUserId={currentUserId} />
            </div>

            {/* Reaction Actions at the bottom */}
            <div className="feed-actions">
                <div className="action-start">
                    <Link
                        href={`/groups/${media.group.id}/albums/${media.album.id}/media/${media.id}`}
                        className="btn-comment"
                    >
                        💬 {media._count.comments}
                    </Link>
                </div>
            </div>

            {showHoverPicker && typeof document !== 'undefined' && createPortal(
                <div
                    className="hover-picker-wrapper"
                    onMouseEnter={onPickerEnter}
                    onMouseLeave={onPickerLeave}
                    style={{
                        position: 'fixed',
                        top: pickerPosition.top,
                        left: pickerPosition.left,
                        transform: 'translateX(-50%)',
                        zIndex: 9999
                    }}
                >
                    <EmojiPicker
                        position={{ top: 0, left: 0 }} // Relative to wrapper
                        currentReaction={undefined}
                        onSelect={(emoji) => {
                            toggleReaction(emoji);
                            // Don't close immediately allow multiple? 
                            // Or close? Usually close.
                            // User liked "multiple reactions", maybe keep open?
                            // Let's keep it open for now, disappears on mouse leave
                        }}
                        onOutsideClick={() => { }}
                        parentButtonRef={null}
                    />
                </div>,
                document.body
            )}

            <style jsx>{`
                .feed-item {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    overflow: visible; 
                    margin-bottom: 2rem;
                    position: relative;
                    z-index: 1;
                }

                .feed-header {
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                }

                .author-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .avatar-placeholder {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                }

                .meta {
                    display: flex;
                    flex-direction: column;
                }

                .author-name {
                    font-weight: 600;
                    color: var(--foreground);
                }

                .context-info {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .group-link {
                    font-weight: 500;
                    color: var(--foreground);
                    text-decoration: none;
                }
                .group-link:hover {
                    text-decoration: underline;
                }

                .media-content-link {
                    display: block;
                    width: 100%;
                    aspect-ratio: 4/5; 
                    position: relative;
                    background: #f0f0f0;
                }

                .image-container, .video-container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }

                .feed-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .video-container video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .reaction-summary-bar {
                    padding: 0.5rem 1rem;
                    border-bottom: 1px solid var(--border-light, #eaeaea);
                    min-height: 20px; /* Prevent collapse if empty? or let it collapse */
                }

                .feed-actions {
                    padding: 0.75rem 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .action-start {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }

                .btn-comment {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-secondary);
                    text-decoration: none;
                    font-size: 0.9rem;
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-full);
                    transition: background 0.2s;
                }
                .btn-comment:hover {
                    background: var(--surface-hover);
                    color: var(--foreground);
                }
            `}</style>
        </div>
    );
}
