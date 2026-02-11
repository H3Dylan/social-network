'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function CreateAlbumPage() {
    const router = useRouter();
    const params = useParams();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/groups/${params.groupId}/albums`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create album');
            }

            const album = await res.json();
            router.push(`/groups/${params.groupId}/albums/${album.id}`);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <div className="card max-w-lg mx-auto">
                <h1 style={{ marginBottom: '1.5rem' }}>Create New Album</h1>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--error)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Album Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="input"
                            placeholder="e.g. Beach Day"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input textarea"
                            placeholder="What's in this album?"
                            rows={4}
                        />
                    </div>

                    <div className="actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => router.back()}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating...' : 'Create Album'}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
        .max-w-lg {
          max-width: 32rem;
          margin-left: auto;
          margin-right: auto;
        }

        .form-group {
          margin-bottom: var(--spacing-6);
        }

        label {
          display: block;
          margin-bottom: var(--spacing-2);
          font-weight: 500;
        }

        .input {
          width: 100%;
          padding: 0.75rem;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--foreground);
          font-family: inherit;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .textarea {
          resize: vertical;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-4);
          margin-top: var(--spacing-8);
        }
      `}</style>
        </div>
    );
}
