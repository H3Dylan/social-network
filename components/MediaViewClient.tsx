'use client';

import { useReactions, Reaction } from '@/hooks/useReactions';
import MediaDisplay from './MediaDisplay';
import MediaReactions from './MediaReactions';
import CommentSection from './CommentSection';

interface MediaViewClientProps {
    media: {
        id: string;
        url: string;
        type: string;
        user: { name: string | null; image: string | null; id: string };
        createdAt: Date;
        reactions: Reaction[];
        comments: any[]; // define proper type if needed, but passing through
    };
    currentUserId?: string;
}

export default function MediaViewClient({ media, currentUserId }: MediaViewClientProps) {
    const { reactions, toggleReaction } = useReactions(
        media.reactions,
        media.id,
        'media',
        currentUserId
    );

    return (
        <div className="media-container">
            <div className="media-display">
                <MediaDisplay
                    media={{
                        id: media.id,
                        url: media.url,
                        type: media.type,
                        user: media.user
                    }}
                    onReact={toggleReaction}
                />
            </div>

            <div className="media-sidebar">
                <div className="sidebar-header">
                    <span className="uploaded-by">Uploaded by {media.user.name}</span>
                    <MediaReactions
                        reactions={reactions}
                    />
                </div>

                <CommentSection
                    mediaId={media.id}
                    initialComments={media.comments.map(c => ({
                        id: c.id,
                        content: c.content,
                        createdAt: c.createdAt.toISOString(),
                        user: c.user,
                        reactions: c.reactions
                    }))}
                    currentUserId={currentUserId}
                />
            </div>

            <style jsx>{`
                /* Reused CSS from page.tsx (or global if it was global, but it seems local there? 
                   Actually page.tsx didn't have style jsx for layout, it relied on globals or other css. 
                   Let's assume the layout classes are global or I need to add them here.
                   Wait, looking at previous page.tsx view, it didn't show style block for .media-container?
                   Ah, I might have missed it or it's in global.css. 
                   Let's add basic flex layout here just in case or rely on existing classes.
                */
                .media-container {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    height: 80vh; /* Adjust as needed */
                }

                @media (min-width: 768px) {
                    .media-container {
                        flex-direction: row;
                    }
                    .media-display {
                        flex: 2;
                        background: #000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 500px;
                    }
                    .media-sidebar {
                        flex: 1;
                        overflow-y: auto;
                        padding: 1rem;
                        background: var(--surface);
                        border-left: 1px solid var(--border);
                    }
                }
                
                .sidebar-header {
                    margin-bottom: 2rem;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 1rem;
                }
                
                .uploaded-by {
                    display: block;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                }
            `}</style>
        </div>
    );
}
