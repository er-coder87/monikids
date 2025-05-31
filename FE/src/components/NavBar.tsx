import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export const NavBar = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const { session, supabaseClient } = useAuth();
    const isAuthenticated = !!session;
    const isLoading = session === undefined;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSignOut = async () => {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            console.error("Error signing out:", error);
            // Optionally show an error message to the user
        } else {
            navigate('/login'); // Redirect to login page after sign out
        }
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 transition-transform duration-300 ${scrolled ? '-translate-y-full' : 'translate-y-0'
                }`}
        >
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <h1
                        onClick={() => navigate('/')}
                        className="text-2xl font-bold text-indigo-600 cursor-pointer"
                    >
                        DigiPig
                    </h1>
                    <div className="flex gap-4 items-center">
                        {isAuthenticated ? (
                            <button
                                onClick={handleSignOut}
                                disabled={isLoading}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Signing out...' : 'Sign out'}
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                disabled={isLoading}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sign in
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};