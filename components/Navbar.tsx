'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link href="/" className="logo">
          Social<span className="text-primary">Net</span>
        </Link>

        <div className="nav-links">
          <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
            Explore
          </Link>
          {session && (
            <Link href="/groups/create" className={`nav-link ${pathname === '/groups/create' ? 'active' : ''}`}>
              Create Group
            </Link>
          )}
        </div>

        <div className="auth-actions">
          {session ? (
            <div className="user-menu">
              <span className="user-name">{session.user?.name}</span>
              <button onClick={() => signOut()} className="btn btn-secondary btn-sm">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link href="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .navbar {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
          padding: var(--spacing-4) 0;
        }

        .navbar-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.05em;
        }

        .text-primary {
          color: var(--primary);
        }

        .nav-links {
          display: flex;
          gap: var(--spacing-6);
        }

        .nav-link {
          font-weight: 500;
          color: var(--foreground);
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .nav-link:hover,
        .nav-link.active {
          opacity: 1;
        }
        
        .nav-link.active {
          color: var(--primary);
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: var(--spacing-4);
        }

        .user-name {
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .btn-sm {
          padding: var(--spacing-1) var(--spacing-3);
          font-size: 0.875rem;
        }
        .auth-buttons {
          display: flex;
          gap: var(--spacing-2);
        }

        .btn-ghost {
          color: var(--foreground);
        }
        
        .btn-ghost:hover {
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </nav>
  );
}
