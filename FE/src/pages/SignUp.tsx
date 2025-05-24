import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppleIcon, Facebook, Mail } from 'lucide-react';
import { NavBar } from '../components/NavBar';
import { useUser } from '../contexts/UserContext';
import { useGoogleLogin } from '@react-oauth/google';
import { apiClient } from '../services/ApiClient';

export default function SignUp() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loginError, setLoginError] = useState('');
    const { login, loginWithGoogle } = useUser();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!email || !password || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            // First create the account
            const response = await apiClient.post<{ user: { id: string; email: string; name: string } }>('/auth/signup', {
                email,
                password
            });

            if (response.error) throw new Error(response.error);
            if (!response.data?.user) throw new Error('No user data received');

            // Then log in with the new credentials
            await login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // 1. Fetch user info using access_token

                console.log('import.meta.env.VITE_GOOGLE_USERINFO_URL', import.meta.env.VITE_GOOGLE_USERINFO_URL)
                const googleUser = await fetch(import.meta.env.VITE_GOOGLE_USERINFO_URL, {
                    headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`,
                    },
                });

                const googleUserData = await googleUser.json();

                // 2. Log in with Google
                await loginWithGoogle({
                    email: googleUserData.email,
                    name: googleUserData.name,
                    accessToken: tokenResponse.access_token
                });

                navigate('/dashboard');
            } catch (error) {
                console.error('Error during Google login:', error);
                setLoginError('Google login failed. Please try again.');
            }
        },
        onError: (error) => {
            console.error('Google Sign-In Failed:', error);
            setLoginError('Google login failed. Please try again.');
        },
    });

    const handleFacebookSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Call API
    };

    const handleAppleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Call API
    };

    return (
        <div>
            <NavBar />
            <div className="mt-16 min-h-screen pt-16 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                        <p className="text-gray-600">Track smarter. Save better.</p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => googleLogin()}
                            className="w-full bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 group"
                        >
                            <Mail className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                            Continue with Google
                        </button>

                        <button
                            onClick={handleFacebookSignUp}
                            className="w-full bg-[#1877F2] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1565c0] transition-colors flex items-center justify-center gap-3 group"
                        >
                            <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Continue with Facebook
                        </button>

                        <button
                            onClick={handleAppleSignUp}
                            className="w-full bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1565c0] transition-colors flex items-center justify-center gap-3 group"
                        >
                            <AppleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Continue with Apple
                        </button>
                    </div>
                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                            </div>
                        </div>

                        <form onSubmit={handleSignUp} className="mt-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Create a password"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Create a password"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </form>
                    </div>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Sign in
                        </button>
                    </p>

                    <p className="mt-4 text-center text-xs text-gray-500">
                        By continuing, you agree to our{' '}
                        <a href="/legal/terms-of-service" className="text-indigo-600 hover:text-indigo-500">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="/legal/privacy-policy" className="text-indigo-600 hover:text-indigo-500">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}