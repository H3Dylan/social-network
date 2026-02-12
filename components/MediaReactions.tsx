'use client';

import { Reaction } from '@/hooks/useReactions';
import { ReactionSummary } from './EmojiReactionButton';

interface MediaReactionsProps {
    reactions: Reaction[];
}

export default function MediaReactions({ reactions }: MediaReactionsProps) {

    return (
        <div className="media-reactions-container">
            {/* Summary on top or distinct? User asked 'hooked below photo' */}
            {/* In Media Page, this component is in the sidebar or below media? 
                In the page.tsx, it was in sidebar-header. 
                Let's put summary then action.
            */}

            <div className="reactions-summary-wrapper">
                <ReactionSummary reactions={reactions} />
            </div>



            <style jsx>{`
                .media-reactions-container {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                }
                .reactions-action-wrapper {
                    display: flex;
                }
            `}</style>
        </div>
    );
}
