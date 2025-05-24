import { useGoogleLogin } from '@react-oauth/google';
import { Facebook, Mail, Eye, EyeOff, AppleIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { NavBar } from '../components/NavBar';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useUser();
  console.log('import.meta.env.VITE_GOOGLE_USERINFO_URL1', import.meta.env.VITE_GOOGLE_USERINFO_URL)
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        setLoginError('');
        console.log('import.meta.env.VITE_GOOGLE_USERINFO_URL2', import.meta.env.VITE_GOOGLE_USERINFO_URL)
        // 1. Fetch user info using access_token
        const googleUser = await fetch(import.meta.env.VITE_GOOGLE_USERINFO_URL, {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        const googleUserData = await googleUser.json();

        await loginWithGoogle({
          email: googleUserData.email,
          name: googleUserData.name,
          accessToken: tokenResponse.access_token
        });
        navigate('/dashboard');
      } catch (error) {
        console.error('Error during Google login:', error);
        setLoginError('Google login failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google Sign-In Failed:', error);
      setLoginError('Google login failed. Please try again.');
    },
  });

  const facebookLogin = () => {
    console.log("facebook Login");
  };

  const appleLogin = () => {
    console.log("Apple Login");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError('');
    setIsLoading(true);

    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      setLoginError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="mt-16 min-h-screen pt-16 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to continue to your account</p>
            {loginError && <p className="mt-2 text-sm text-red-500">{loginError}</p>}
          </div>

          <div className="space-y-4">
            <button
              onClick={() => googleLogin()}
              disabled={isLoading}
              className="w-full bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
              Continue with Google
            </button>

            <button
              onClick={facebookLogin}
              disabled={isLoading}
              className="w-full bg-[#1877F2] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1565c0] transition-colors flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Continue with Facebook
            </button>

            <button
              onClick={appleLogin}
              disabled={isLoading}
              className="w-full bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1565c0] transition-colors flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AppleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Continue with Apple
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Enter your email"
                aria-describedby="email-description"
              />
              <p id="email-description" className="sr-only">Enter your email address to sign in.</p>
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
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none pr-10"
                  placeholder="Enter your password"
                  aria-describedby="password-description"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p id="password-description" className="sr-only">Enter your password to sign in.</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign up
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