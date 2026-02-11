'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [data, setData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const res = await signIn('credentials', {
            redirect: false,
            username: data.email,
            password: data.password,
        });

        if (res?.error) {
            setError('Invalid email or password');
        } else {
            router.push('/');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Welcome Back</h1>
                <p className="auth-subtitle">Sign in to continue</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={data.email}
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                            required
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={data.password}
                            onChange={(e) => setData({ ...data, password: e.target.value })}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary full-width">
                        Sign In
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link href="/register">Sign up</Link>
                </p>
            </div>

            <style jsx>{`
                .auth-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--background);
                    padding: var(--spacing-4);
                }

                .auth-card {
                    background: var(--surface);
                    padding: 2rem;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border);
                    width: 100%;
                    max-width: 400px;
                    box-shadow: var(--shadow-lg);
                }

                h1 {
                    font-size: 1.75rem;
                    text-align: center;
                    margin-bottom: 0.5rem;
                }

                .auth-subtitle {
                    text-align: center;
                    color: #94a3b8;
                    margin-bottom: 2rem;
                }

                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                label {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--foreground);
                }

                input {
                    padding: 0.75rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                    background: var(--background);
                    color: var(--foreground);
                    font-size: 1rem;
                }

                input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
                }

                .full-width {
                    width: 100%;
                    padding: 0.75rem;
                }

                .error-message {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--error);
                    padding: 0.75rem;
                    border-radius: var(--radius-md);
                    margin-bottom: 1.5rem;
                    font-size: 0.875rem;
                    text-align: center;
                }

                .auth-footer {
                    margin-top: 1.5rem;
                    text-align: center;
                    font-size: 0.875rem;
                    color: #94a3b8;
                }

                .auth-footer a {
                    color: var(--primary);
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}
