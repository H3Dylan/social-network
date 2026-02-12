'use client';

import Link from "next/link";
import Feed from "@/components/Feed";
import GlobalUploadButton from "@/components/GlobalUploadButton";

interface HomeClientProps {
  groups: any[];
  feedItems: any[];
  currentUserId?: string | null;
}

export default function HomeClient({ groups, feedItems, currentUserId }: HomeClientProps) {
  return (
    <div className="home-page">
      <div className="container layout-grid">
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3>My Groups</h3>
            <div className="mini-groups-list">
              {groups.map((group) => (
                <Link key={group.id} href={`/groups/${group.id}`} className="mini-group-card">
                  <span className="group-name">{group.name}</span>
                </Link>
              ))}
              {groups.length === 0 && (
                <p className="empty-text">No groups yet.</p>
              )}
            </div>
            <Link href="/groups/create" className="btn-text">
              + Create New Group
            </Link>
          </div>
        </aside>

        <main className="main-feed">
          <h1 className="feed-title">Home Feed</h1>
          <Feed items={feedItems} currentUserId={currentUserId || undefined} />
        </main>
      </div>

      <GlobalUploadButton />

      <style jsx>{`
        .layout-grid {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 2rem;
          padding-top: 2rem;
        }

        @media (max-width: 768px) {
          .layout-grid {
            grid-template-columns: 1fr;
          }
          .sidebar {
            display: none; 
          }
        }

        .sidebar-section {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          position: sticky;
          top: 80px;
        }

        .sidebar-section h3 {
          margin-bottom: 1rem;
          font-size: 1.1rem;
          color: var(--foreground);
        }

        .mini-groups-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .mini-group-card {
          padding: 0.75rem;
          background: var(--background);
          border-radius: var(--radius-md);
          text-decoration: none;
          color: var(--foreground);
          transition: background 0.2s;
        }
        .mini-group-card:hover {
          background: var(--surface-hover);
        }

        .group-name {
          font-weight: 500;
          font-size: 0.9rem;
        }

        .btn-text {
          color: var(--primary);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .btn-text:hover {
          text-decoration: underline;
        }

        .feed-title {
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }
        
        .empty-text {
             color: var(--text-secondary);
             font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
