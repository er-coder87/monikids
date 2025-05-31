import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { NavBar } from '../components/NavBar';

const SignPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);
    const navigate = useNavigate();
    const supabase = useSupabaseClient();

    // Validation states
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
    const [supabaseError, setSupabaseError] = useState<string | null>(null); // For Supabase errors

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const validateEmail = (email: string): string | null => {
        if (!email) {
            return 'Email is required.';
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            return 'Invalid email format.';
        }
        return null;
    };

    const validatePassword = (password: string): string | null => {
        if (!password) {
            return 'Password is required.';
        }
        if (password.length < 6) {
            return 'Password must be at least 6 characters long.';
        }
        return null;
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setEmailError(validateEmail(e.target.value));
        setSupabaseError(null); // Clear Supabase error on input change
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        setPasswordError(validatePassword(e.target.value));
        setSupabaseError(null); // Clear Supabase error on input change
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        setConfirmPasswordError(
            e.target.value !== password ? 'Passwords do not match.' : null
        );
        setSupabaseError(null); // Clear Supabase error on input change
    };

    const handleEmailPasswordSignup = async (event: React.FormEvent) => {
        event.preventDefault();
        setSupabaseError(null); // Clear any previous Supabase error

        const emailValidationResult = validateEmail(email);
        const passwordValidationResult = validatePassword(password);
        const confirmPasswordValidationResult =
            password !== confirmPassword ? 'Passwords do not match.' : null;

        setEmailError(emailValidationResult);
        setPasswordError(passwordValidationResult);
        setConfirmPasswordError(confirmPasswordValidationResult);

        if (emailValidationResult || passwordValidationResult || confirmPasswordValidationResult) {
            return; // Stop submission if there are client-side validation errors
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                console.error('Signup error:', error);
                setSupabaseError('Something went wrong during signup.'); // Generic message
            } else {
                setSignupSuccess(true); // Set signup success state
            }
        } catch (error: any) {
            console.error('Unexpected signup error:', error);
            toast.error('An unexpected error occurred during signup.'); // Keep toast for unexpected errors
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) {
                console.error('Google signup error:', error);
                toast.error(`Google signup failed: ${error.message}`); // Keep specific message for Google
            }
        } catch (error: any) {
            console.error('Unexpected Google signup error:', error);
            toast.error('An unexpected error occurred during Google signup.'); // Keep specific message for Google
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <NavBar />
            <div className="mt-16 min-h-screen pt-16 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                        <p className="text-gray-600">Sign up to join our community</p>
                    </div>

                    {signupSuccess ? (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Success!</strong>
                            <span className="block sm:inline"> Please check your email to verify your account.</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <button
                                onClick={handleGoogleSignup}
                                disabled={loading}
                                className="w-full bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Mail className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                                Continue with Google
                            </button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                                </div>
                            </div>

                            <form onSubmit={handleEmailPasswordSignup} className="space-y-4">
                                {/* Email, Password, Confirm Password fields */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        placeholder="Enter your email"
                                    />
                                    {emailError && <p className="mt-1 text-sm text-red-500">{emailError}</p>}
                                    {supabaseError && <p className="mt-1 text-sm text-red-500">{supabaseError}</p>}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            value={password}
                                            onChange={handlePasswordChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none pr-10"
                                            placeholder="Enter your password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {passwordError && <p className="mt-1 text-sm text-red-500">{passwordError}</p>}
                                </div>

                                <div>
                                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            id="confirm-password"
                                            name="confirm-password"
                                            value={confirmPassword}
                                            onChange={handleConfirmPasswordChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none pr-10"
                                            placeholder="Confirm your password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                                            onClick={toggleConfirmPasswordVisibility}
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {confirmPasswordError && <p className="mt-1 text-sm text-red-500">{confirmPasswordError}</p>}
                                </div>

                                {supabaseError && <p className="mb-2 text-sm text-red-500">{supabaseError}</p>}

                                <button
                                    type="submit"
                                    disabled={loading || emailError !== null || passwordError !== null || confirmPasswordError !== null}
                                    className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Creating Account...' : 'Sign Up'}
                                </button>
                            </form>
                        </div>
                    )}

                    <p className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignPage;