'use client';

import { createPortal } from 'react-dom';
import EmojiPicker from './EmojiPicker';
import { useHoverPicker } from '@/hooks/useHoverPicker';


interface MediaDisplayProps {
    media: {
        id: string;
        url: string;
        type: string;
        user: { name: string | null };
    };
    onReact: (emoji: string) => void;
}

export default function MediaDisplay({ media, onReact }: MediaDisplayProps) {

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
            className="media-display-container"
            ref={triggerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {media.type === 'VIDEO' ? (
                <video src={media.url} controls className="media-content" autoPlay />
            ) : (
                <div className="image-wrapper">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={media.url}
                        alt="Media Detail"
                        className="media-image"
                    />
                </div>
            )}

            {showHoverPicker && typeof document !== 'undefined' && createPortal(
                <div
                    className="hover-picker-wrapper"
                    onMouseEnter={onPickerEnter}
                    onMouseLeave={onPickerLeave}
                    style={{
                        position: 'fixed',
                        top: pickerPosition.top,
                        left: pickerPosition.left,
                        transform: 'translateX(-50%)', // Center align
                        zIndex: 9999
                    }}
                >
                    <EmojiPicker
                        position={{ top: 0, left: 0 }}
                        currentReaction={undefined}
                        onSelect={(emoji) => onReact(emoji)}
                        onOutsideClick={() => { }}
                        parentButtonRef={null}
                    />
                </div>,
                document.body
            )}

            <style jsx>{`
                .media-display-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: black;
                    position: relative;
                }
                
                .media-content {
                    max-width: 100%;
                    max-height: 100%;
                }

                .image-wrapper {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .media-image {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }
            `}</style>
        </div>
    );
}
