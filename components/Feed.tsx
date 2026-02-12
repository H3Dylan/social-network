'use client';

import FeedItem from './FeedItem';

interface FeedProps {
    items: any[];
    currentUserId?: string;
}

export default function Feed({ items, currentUserId }: FeedProps) {
    if (items.length === 0) {
        return (
            <div className="empty-feed">
                <div className="empty-content">
                    <h2>Your feed is empty</h2>
                    <p>Join more groups or upload photos to see them here!</p>
                </div>
                <style jsx>{`
                    .empty-feed {
                        padding: 3rem;
                        text-align: center;
                        background: var(--surface);
                        border-radius: var(--radius-lg);
                        border: 1px solid var(--border);
                    }
                    h2 { margin-bottom: 0.5rem; }
                    p { color: var(--text-secondary); }
                `}</style>
            </div>
        );
    }

    return (
        <div className="feed-list">
            {items.map((item) => (
                <FeedItem key={item.id} media={item} currentUserId={currentUserId} />
            ))}
        </div>
    );
}
