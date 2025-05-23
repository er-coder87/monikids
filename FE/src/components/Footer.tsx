import { Link } from 'react-router-dom'

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="text-gray-600 text-sm mb-4 md:mb-0">
                        © 2025 Maum Solution Ltd. All rights reserved.
                    </div>
                    <div className="flex gap-6">
                        <Link
                            to="/legal/privacy-policy"
                            className="text-gray-600 hover:text-indigo-600 text-sm transition-colors"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            to="/legal/terms-of-service"
                            className="text-gray-600 hover:text-indigo-600 text-sm transition-colors"
                        >
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
} 