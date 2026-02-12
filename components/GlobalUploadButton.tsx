'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Group {
    id: string;
    name: string;
    albums: { id: string; title: string; }[];
}

export default function GlobalUploadButton() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');
    const [selectedAlbumId, setSelectedAlbumId] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch groups and albums when modal opens
    useEffect(() => {
        if (isOpen && groups.length === 0) {
            setIsLoadingGroups(true);
            fetch('/api/user/groups-with-albums')
                .then(res => res.json())
                .then(data => {
                    setGroups(data);
                    setIsLoadingGroups(false);
                })
                .catch(err => {
                    console.error("Failed to fetch groups", err);
                    setIsLoadingGroups(false);
                });
        }
    }, [isOpen]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedGroupId || !selectedAlbumId) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            // Convert to Base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Data = reader.result as string;

                const res = await fetch(`/api/groups/${selectedGroupId}/albums/${selectedAlbumId}/media`, {
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
                } else {
                    setIsOpen(false);
                    router.refresh();
                }
                setIsUploading(false);
            };
        } catch (err) {
            console.error(err);
            alert("Error uploading file");
            setIsUploading(false);
        }
    };

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => {
        setIsOpen(false);
        setSelectedGroupId('');
        setSelectedAlbumId('');
    };

    const selectedGroup = groups.find(g => g.id === selectedGroupId);

    return (
        <>
            <button className="btn-primary-fab" onClick={handleOpen}>
                +
            </button>

            {isOpen && (
                <div className="modal-overlay" onClick={handleClose}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Create Post</h2>

                        {isLoadingGroups ? (
                            <p>Loading your groups...</p>
                        ) : (
                            <div className="form-group">
                                <label>Select Group</label>
                                <select
                                    value={selectedGroupId}
                                    onChange={e => {
                                        setSelectedGroupId(e.target.value);
                                        setSelectedAlbumId('');
                                    }}
                                >
                                    <option value="">-- Select Group --</option>
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {selectedGroupId && selectedGroup && (
                            <div className="form-group">
                                <label>Select Album</label>
                                <select
                                    value={selectedAlbumId}
                                    onChange={e => setSelectedAlbumId(e.target.value)}
                                >
                                    <option value="">-- Select Album --</option>
                                    {selectedGroup.albums.map(a => (
                                        <option key={a.id} value={a.id}>{a.title}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="modal-actions">
                            <input
                                type="file"
                                accept="image/*,video/*"
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />

                            <button className="btn-cancel" onClick={handleClose}>Cancel</button>
                            <button
                                className="btn-upload"
                                disabled={!selectedAlbumId || isUploading}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {isUploading ? 'Uploading...' : 'Select Photo & Post'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .btn-primary-fab {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: var(--primary);
                    color: white;
                    font-size: 2rem;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 100;
                    transition: transform 0.2s;
                }
                .btn-primary-fab:hover {
                    transform: scale(1.1);
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .modal-content {
                    background: var(--surface);
                    padding: 2rem;
                    border-radius: var(--radius-lg);
                    width: 90%;
                    max-width: 500px;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                }

                select {
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                    background: var(--background);
                    color: var(--foreground);
                }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 2rem;
                }

                .btn-cancel {
                    padding: 0.75rem 1.5rem;
                    background: transparent;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                }

                .btn-upload {
                    padding: 0.75rem 1.5rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                }
                .btn-upload:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </>
    );
}
