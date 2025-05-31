import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { NavBar } from '../components/NavBar'; // Import the NavBar

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const supabase = useSupabaseClient();
    const navigate = useNavigate();

    useEffect(() => {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (token_hash && type === 'email') {
            const verifyEmail = async () => {
                const { error } = await supabase.auth.verifyOtp({
                    token_hash,
                    type,
                });

                if (error) {
                    console.error('Email verification error:', error);
                    setVerificationStatus('error');
                } else {
                    setVerificationStatus('success');
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                }
            };

            verifyEmail();
        } else {
            setVerificationStatus('error');
        }
    }, [searchParams, supabase, navigate]);

    return (
        <div>
            <NavBar />
            <div className="flex justify-center items-center min-h-screen bg-gray-100 pt-16"> {/* Added pt-16 to account for fixed NavBar */}
                <div className="bg-white p-8 rounded shadow-md">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Verify Your Email</h2>
                    </div>
                    {verificationStatus === 'verifying' && (
                        <div className="text-center">
                            <svg className="animate-spin h-10 w-10 mx-auto text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0c-3.14 0-6 1.39-8 3.14z"></path>
                            </svg>
                            <p className="mt-4 text-gray-600">Verifying your email...</p>
                        </div>
                    )}
                    {verificationStatus === 'success' && (
                        <div className="text-center">
                            <svg className="mx-auto h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="mt-4 text-green-600 font-semibold">Email verified successfully!</p>
                            <p className="mt-2 text-gray-600">Redirecting to login...</p>
                        </div>
                    )}
                    {verificationStatus === 'error' && (
                        <div className="text-center">
                            <svg className="mx-auto h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="mt-4 text-red-600 font-semibold">Email verification failed.</p>
                            <p className="mt-2 text-gray-600">Please try again or request a new link.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;