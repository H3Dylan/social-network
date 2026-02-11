'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface GroupActionsProps {
    groupId: string;
    isOwner: boolean;
}

export default function GroupActions({ groupId, isOwner }: GroupActionsProps) {
    const router = useRouter();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);
        try {
            const res = await fetch(`/api/groups/${groupId}/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail })
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || "Failed to invite");
                return;
            }

            alert("User invited successfully!");
            setInviteEmail('');
            setShowInviteModal(false);
            router.refresh(); // Refresh to update member count if we showed it live, or just because.
        } catch (err) {
            alert("Something went wrong");
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <div className="actions">
            {isOwner && (
                <button onClick={() => setShowInviteModal(true)} className="btn btn-secondary">
                    Invite Members
                </button>
            )}
            <button className="btn btn-primary" onClick={() => router.push(`/groups/${groupId}/albums/create`)}>
                Create Album
            </button>

            {showInviteModal && (
                <div className="modal-backdrop" onClick={() => setShowInviteModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Invite Member</h3>
                        <form onSubmit={handleInvite}>
                            <input
                                type="email"
                                placeholder="User email"
                                value={inviteEmail}
                                onChange={e => setInviteEmail(e.target.value)}
                                required
                                className="input"
                            />
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowInviteModal(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" disabled={isInviting} className="btn btn-primary">
                                    {isInviting ? 'Inviting...' : 'Invite'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
        .actions {
            display: flex;
            gap: var(--spacing-4);
        }

        .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .modal {
            background: var(--surface);
            padding: var(--spacing-6);
            border-radius: var(--radius-lg);
            width: 100%;
            max-width: 400px;
            border: 1px solid var(--border);
        }

        .modal h3 {
            margin-bottom: var(--spacing-4);
        }

        .input {
            width: 100%;
            padding: 0.75rem;
            margin-bottom: var(--spacing-4);
            border-radius: var(--radius-md);
            border: 1px solid var(--border);
            background: var(--background);
            color: var(--foreground);
        }

        .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: var(--spacing-2);
        }
      `}</style>
        </div>
    );
}
