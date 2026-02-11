'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReactionButton({ mediaId, initialCount, initialLiked }: { mediaId: string, initialCount: number, initialLiked: boolean }) {
    const router = useRouter();
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount);
    const [isLoading, setIsLoading] = useState(false);

    const toggleLike = async () => {
        if (isLoading) return;
        setIsLoading(true);

        // Optimistic update
        const newLiked = !liked;
        setLiked(newLiked);
        setCount(prev => newLiked ? prev + 1 : prev - 1);

        try {
            const res = await fetch(`/api/media/${mediaId}/reactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'LIKE' })
            });

            if (!res.ok) {
                // Revert if failed
                setLiked(!newLiked);
                setCount(prev => !newLiked ? prev + 1 : prev - 1);
            } else {
                router.refresh();
            }
        } catch (error) {
            setLiked(!newLiked);
            setCount(prev => !newLiked ? prev + 1 : prev - 1);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={toggleLike}
            className={`btn-reaction ${liked ? 'liked' : ''}`}
            disabled={isLoading}
        >
            <span className="icon">♥</span>
            <span className="count">{count}</span>
            <span className="label">{liked ? 'Liked' : 'Like'}</span>

            <style jsx>{`
                .btn-reaction {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    padding: var(--spacing-2) var(--spacing-4);
                    border-radius: var(--radius-full);
                    border: 1px solid var(--border);
                    background: var(--surface);
                    color: var(--foreground);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-reaction:hover {
                    background: var(--surface-hover);
                }

                .btn-reaction.liked {
                    border-color: var(--secondary);
                    color: var(--secondary);
                    background: rgba(236, 72, 153, 0.1);
                }

                .icon {
                    font-size: 1.25rem;
                }

                .count {
                    font-weight: 600;
                }
            `}</style>
        </button>
    );
}
