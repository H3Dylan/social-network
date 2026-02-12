'use client';

import { useEffect, useRef } from 'react';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

interface EmojiPickerProps {
    position: { top: number; left: number };
    currentReaction?: string;
    onSelect: (emoji: string) => void;
    onOutsideClick: () => void;
    parentButtonRef: React.RefObject<HTMLButtonElement | null> | null;
}

export default function EmojiPicker({ position, currentReaction, onSelect, onOutsideClick, parentButtonRef }: EmojiPickerProps) {
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target as Node) &&
                (!parentButtonRef || (parentButtonRef.current && !parentButtonRef.current.contains(event.target as Node)))
            ) {
                onOutsideClick();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onOutsideClick, parentButtonRef]);

    return (
        <div
            className="emoji-picker-portal"
            ref={pickerRef}
            style={{
                top: position.top,
                left: position.left,
                position: 'fixed',
                zIndex: 9999
            }}
        >
            {EMOJIS.map(emoji => (
                <button
                    key={emoji}
                    className={`emoji-option ${currentReaction === emoji ? 'selected' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(emoji);
                    }}
                >
                    {emoji}
                </button>
            ))}
            <style jsx>{`
                .emoji-picker-portal {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-full);
                    padding: 0.5rem;
                    display: flex;
                    gap: 0.25rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    animation: popIn 0.2s ease-out;
                    white-space: nowrap;
                }

                @keyframes popIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                .emoji-option {
                    background: transparent;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 50%;
                    transition: transform 0.2s, background 0.2s;
                    line-height: 1;
                }

                .emoji-option:hover {
                    transform: scale(1.2);
                    background: var(--surface-hover);
                }
                
                .emoji-option.selected {
                    background: var(--surface-hover);
                    transform: scale(1.2);
                }
            `}</style>
        </div>
    );
}
