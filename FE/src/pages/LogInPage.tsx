import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
    const { loginWithRedirect, error, isAuthenticated, isLoading } = useAuth0();
    const [isRedirecting, setIsRedirecting] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            // User already logged in, send to root page
            navigate('/dashboard');
            return;
        }

        if (!isLoading && !isAuthenticated) {
            // User not logged in, start login redirect
            const redirectToLogin = async () => {
                try {
                    await loginWithRedirect({
                        appState: { returnTo: '/dashboard' },
                    });
                } catch (err) {
                    setIsRedirecting(false);
                    console.error('Login redirect failed:', err);
                }
            };
            redirectToLogin();
        }
    }, [isLoading, isAuthenticated, loginWithRedirect, navigate]);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
                <div className="text-red-600 dark:text-red-400 mb-4">
                    {error.message || 'An error occurred during login'}
                </div>
                <button
                    onClick={() => loginWithRedirect({ appState: { returnTo: '/' } })}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (isRedirecting || isLoading) return <LoadingSpinner />;

    return null;
}