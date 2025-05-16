import { Link } from 'react-router-dom'; // Assuming you're using React Router

const UnauthorizedPage = () => (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 min-h-screen flex items-center justify-center">
        <div className="container mx-auto text-center py-12 px-6">
            <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
            <p className="text-lg mb-6">
                To view the expense dashboard and manage your finances, please log in to your account.
            </p>
            <Link to="/login" className="bg-indigo-500 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline">
                Log In
            </Link>
            <p className="mt-4 text-sm">
                Don't have an account? <Link to="/register" className="text-indigo-500 hover:text-indigo-700">Sign Up</Link>
            </p>
        </div>
    </div>
);

export default UnauthorizedPage;