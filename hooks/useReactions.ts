import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface Reaction {
    userId: string;
    emoji: string;
    user: { name: string | null };
}

export function useReactions(
    initialReactions: Reaction[],
    targetId: string,
    targetType: 'media' | 'comment',
    currentUserId?: string
) {
    const router = useRouter();
    const [reactions, setReactions] = useState(initialReactions);
    const [isLoading, setIsLoading] = useState(false);

    const toggleReaction = async (emoji: string) => {
        if (isLoading) return;
        setIsLoading(true);

        // Optimistic update
        let newReactions = [...reactions];
        const existingIndex = newReactions.findIndex(r => r.userId === currentUserId && r.emoji === emoji);

        if (existingIndex > -1) {
            newReactions.splice(existingIndex, 1);
        } else if (currentUserId) {
            newReactions.push({ emoji, userId: currentUserId, user: { name: "You" } });
        }

        setReactions(newReactions);

        try {
            const endpoint = targetType === 'media'
                ? `/api/media/${targetId}/reactions`
                : `/api/comments/${targetId}/reactions`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emoji })
            });

            if (!res.ok) {
                setReactions(initialReactions);
                console.error("Failed to react");
            } else {
                router.refresh();
            }
        } catch (error) {
            setReactions(initialReactions);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return { reactions, toggleReaction, isLoading };
}
