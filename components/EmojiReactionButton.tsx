'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import EmojiPicker from './EmojiPicker';
import { Reaction } from '@/hooks/useReactions';

// ----------------------------------------------------------------------
// Types & Helpers
// ----------------------------------------------------------------------

interface ReactionActionProps {
    reactions: Reaction[];
    currentUserId?: string;
    onReact: (emoji: string) => void;
}

interface ReactionSummaryProps {
    reactions: Reaction[];
    currentUserId?: string;
}

// ----------------------------------------------------------------------
// Component: ReactionAction (The Button)
// ----------------------------------------------------------------------

export function ReactionAction({ reactions, currentUserId, onReact }: ReactionActionProps) {
    const [showPicker, setShowPicker] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

    const userReactions = reactions.filter(r => r.userId === currentUserId);
    const hasReacted = userReactions.length > 0;

    const updatePickerPosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPickerPosition({
                top: rect.top - 60,
                left: rect.left
            });
        }
    };

    useEffect(() => {
        if (showPicker) {
            updatePickerPosition();
            window.addEventListener('scroll', updatePickerPosition, true);
            window.addEventListener('resize', updatePickerPosition);
        }
        return () => {
            window.removeEventListener('scroll', updatePickerPosition, true);
            window.removeEventListener('resize', updatePickerPosition);
        };
    }, [showPicker]);

    return (
        <>
            <button
                ref={buttonRef}
                className={`reaction-btn ${hasReacted ? 'active' : ''}`}
                onClick={() => setShowPicker(!showPicker)}
            >
                <span className="icon">👍</span>
            </button>

            {showPicker && typeof document !== 'undefined' && createPortal(
                <EmojiPicker
                    position={pickerPosition}
                    currentReaction={undefined}
                    onSelect={(emoji) => {
                        onReact(emoji);
                        setShowPicker(false);
                    }}
                    onOutsideClick={() => setShowPicker(false)}
                    parentButtonRef={buttonRef}
                />,
                document.body
            )}

            <style jsx>{`
                .reaction-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border: 1px solid var(--border);
                    border-radius: 50%; /* Circle shape matches user request often? Or keep pill? */
                    /* User removed text, so circle/square is better than pill. Let's stick to pill/rounded for now */
                    border-radius: var(--radius-full);
                    background: var(--surface);
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 1.2rem;
                    padding: 0;
                }

                .reaction-btn:hover {
                    background: var(--surface-hover);
                }

                .reaction-btn.active {
                    border-color: var(--primary);
                    background: rgba(59, 130, 246, 0.1);
                    color: var(--primary);
                }
                
                .icon {
                    line-height: 1;
                    display: block;
                }
            `}</style>
        </>
    );
}

// ----------------------------------------------------------------------
// Component: ReactionSummary (The Counts)
// ----------------------------------------------------------------------

export function ReactionSummary({ reactions }: ReactionSummaryProps) {
    const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);

    // Group reactions by emoji with names
    const reactionGroups = reactions.reduce((acc, r) => {
        if (!acc[r.emoji]) {
            acc[r.emoji] = { count: 0, names: [] };
        }
        acc[r.emoji].count += 1;
        if (r.user.name) {
            acc[r.emoji].names.push(r.user.name);
        } else {
            acc[r.emoji].names.push("Unknown");
        }
        return acc;
    }, {} as Record<string, { count: number; names: string[] }>);

    if (Object.keys(reactionGroups).length === 0) return null;

    return (
        <div className="reaction-summary">
            {Object.entries(reactionGroups).map(([emoji, data]) => (
                <div
                    key={emoji}
                    className="count-item"
                    onMouseEnter={() => setHoveredEmoji(emoji)}
                    onMouseLeave={() => setHoveredEmoji(null)}
                >
                    <span className="small-emoji">{emoji}</span>
                    <span className="count-num">{data.count}</span>

                    {hoveredEmoji === emoji && (
                        <div className="tooltip">
                            <div className="tooltip-content">
                                {data.names.slice(0, 5).map((name, idx) => (
                                    <div key={idx}>{name}</div>
                                ))}
                                {data.names.length > 5 && (
                                    <div className="more">And {data.names.length - 5} more...</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}

            <style jsx>{`
                .reaction-summary {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .count-item {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    padding: 0.25rem 0.5rem;
                    border-radius: var(--radius-md);
                    cursor: default;
                    position: relative;
                    background: var(--surface-hover);
                }

                .small-emoji {
                    font-size: 1rem;
                }
                
                .tooltip {
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    margin-bottom: 8px;
                    z-index: 1000;
                    pointer-events: none;
                }
                
                .tooltip-content {
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 0.5rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    white-space: nowrap;
                    min-width: 100px;
                    text-align: center;
                }
                
                .tooltip::after {
                    content: '';
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    margin-left: -5px;
                    border-width: 5px;
                    border-style: solid;
                    border-color: rgba(0,0,0,0.8) transparent transparent transparent;
                }
                
                .more {
                    color: #ccc;
                    margin-top: 2px;
                    font-style: italic;
                }
            `}</style>
        </div>
    );
}

// Keep default export for backward compatibility if needed, but we essentially deprecated the combined component
// Actually, let's export a wrapper that mimics the old behavior just in case
export default function EmojiReactionButton(props: any) {
    return <div>Deprecated. Use named exports.</div>;
}
