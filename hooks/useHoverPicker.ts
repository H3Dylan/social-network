import { useState, useRef, useEffect, useCallback } from 'react';

interface HoverPickerOptions {
    hoverDelay?: number;
    hideDelay?: number;
    offset?: { x: number; y: number };
}

export function useHoverPicker({ hoverDelay = 600, hideDelay = 500 }: HoverPickerOptions = {}) {
    const [showHoverPicker, setShowHoverPicker] = useState(false);
    const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    // Clear timeouts on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        };
    }, []);

    const handleMouseEnter = useCallback(() => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

        if (!showHoverPicker) {
            hoverTimeoutRef.current = setTimeout(() => {
                if (triggerRef.current) {
                    const rect = triggerRef.current.getBoundingClientRect();
                    // Calculate position: Center bottom of the item
                    // Using fixed positioning relative to viewport
                    const top = rect.bottom - 60; // Slightly overlapping bottom
                    const left = rect.left + (rect.width / 2);

                    setPickerPosition({ top, left });
                    setShowHoverPicker(true);
                }
            }, hoverDelay);
        }
    }, [showHoverPicker, hoverDelay]);

    const handleMouseLeave = useCallback(() => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

        hideTimeoutRef.current = setTimeout(() => {
            setShowHoverPicker(false);
        }, hideDelay);
    }, [hideDelay]);

    const onPickerEnter = useCallback(() => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    }, []);

    const onPickerLeave = useCallback(() => {
        hideTimeoutRef.current = setTimeout(() => {
            setShowHoverPicker(false);
        }, hideDelay);
    }, [hideDelay]);

    return {
        showHoverPicker,
        pickerPosition,
        triggerRef,
        handleMouseEnter,
        handleMouseLeave,
        onPickerEnter,
        onPickerLeave,
        setShowHoverPicker
    };
}
