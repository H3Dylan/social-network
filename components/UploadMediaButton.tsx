'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadMediaButton({ groupId, albumId }: { groupId: string, albumId: string }) {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // Convert to Base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Data = reader.result as string;

                const res = await fetch(`/api/groups/${groupId}/albums/${albumId}/media`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileData: base64Data,
                        fileName: file.name,
                        fileType: file.type
                    })
                });

                if (!res.ok) {
                    alert("Failed to upload");
                    return;
                }

                router.refresh();
            };
        } catch (err) {
            console.error(err);
            alert("Error uploading file");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            <input
                type="file"
                accept="image/*,video/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
            />
            <button
                className="btn btn-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
            >
                {isUploading ? 'Uploading...' : 'Upload Media'}
            </button>
        </div>
    );
}

import { useRef } from 'react';
