import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

export const NavBar = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useUser();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 transition-transform duration-300 ${scrolled ? '-translate-y-full' : 'translate-y-0'
                }`}
        >
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <h1 onClick={() => navigate('/')} className="text-2xl font-bold text-indigo-600 cursor-pointer">
                        DigiPig
                    </h1>
                    <div className="flex gap-4 items-center">
                        {isAuthenticated ? (
                            <button
                                onClick={() => {
                                    logout();
                                    navigate('/login');
                                }}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
                            >
                                Logout
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};