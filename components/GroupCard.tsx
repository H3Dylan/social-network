'use client';

import Link from 'next/link';

interface GroupCardProps {
    id: string;
    name: string;
    description: string | null;
    memberCount: number;
    albumCount: number;
}

export default function GroupCard({ id, name, description, memberCount, albumCount }: GroupCardProps) {
    return (
        <Link href={`/groups/${id}`} className="group-card">
            <div className="card-content">
                <h3 className="group-name">{name}</h3>
                <p className="group-desc">{description || "No description provided."}</p>

                <div className="group-stats">
                    <span className="stat">
                        <span className="stat-value">{memberCount}</span> Members
                    </span>
                    <span className="stat">
                        <span className="stat-value">{albumCount}</span> Albums
                    </span>
                </div>
            </div>

            <style jsx>{`
        .group-card {
          display: block;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: var(--spacing-6);
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
          text-decoration: none;
        }

        .group-card:hover {
          transform: translateY(-4px);
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }

        .group-name {
          font-size: 1.25rem;
          margin-bottom: var(--spacing-2);
          color: var(--foreground);
        }

        .group-desc {
          font-size: 0.875rem;
          color: #94a3b8;
          margin-bottom: var(--spacing-4);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.5;
        }

        .group-stats {
          display: flex;
          gap: var(--spacing-4);
          border-top: 1px solid var(--border);
          padding-top: var(--spacing-4);
        }

        .stat {
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          color: var(--foreground);
          font-weight: 600;
          margin-right: var(--spacing-1);
        }
      `}</style>
        </Link>
    );
}
