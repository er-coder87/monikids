import piggybankKids from './assets/kids-with-piggybanks.jpg';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ArrowRight, PiggyBank, BookOpen, Sparkles, Shield, BarChart } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import UnauthorizedPage from './pages/UnauthorizedPage';
import SignUp from './pages/SignUp';
import LearnMore from './pages/LearnMore';
import { NavBar } from './components/NavBar';
import { useUser } from './contexts/UserContext';
import { TimePeriodProvider } from './contexts/TimePeriodContext';

function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUser();
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation Bar */}
      <NavBar />
      <div className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Child's First
              <span className="text-pink-600"> Digital Piggy Bank</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Start your child's financial journey with our kid-friendly piggybank app. Track savings, manage chores, and teach valuable money lessons in a fun and engaging way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={isAuthenticated ? () => navigate('/dashboard') : () => navigate('/login')}
                className="px-8 py-4 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors inline-flex items-center justify-center group"
              >
                Get Started
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/learn-more')}
                className="px-8 py-4 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-72 h-72 bg-indigo-200 rounded-full opacity-30 blur-3xl"></div>
              <div className="absolute -bottom-8 -right-8 w-72 h-72 bg-purple-200 rounded-full opacity-30 blur-3xl"></div>
              <img
                src={piggybankKids}
                alt="Kids learning about money"
                className="rounded-2xl shadow-2xl relative z-10"
              />
            </div>
          </div>
        </div>
        {/* Video Demo Section */}
        <div className="mt-32 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            See How It Works
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Watch our quick demo to see how Monikids helps you teach financial literacy to your children through fun and interactive piggybank management.
          </p>
          <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/d9mWh03Z0SA"
                title="Product Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
        {/* Features Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <PiggyBank size={32} className="text-indigo-600" />,
              title: "Digital Piggybank",
              description: "Manage your child's savings, track allowances, and monitor spending habits"
            },
            {
              icon: <BookOpen size={32} className="text-indigo-600" />,
              title: "Financial Education",
              description: "Build strong money habits through interactive lessons and real-world practice"
            },
            {
              icon: <Sparkles size={32} className="text-indigo-600" />,
              title: "Kid-Friendly Interface",
              description: "Simple and engaging design that makes learning about money fun"
            },
            {
              icon: <BarChart size={32} className="text-indigo-600" />,
              title: "Smart Tracking",
              description: "Monitor savings goals, chore completion, and spending patterns"
            }
          ].map((feature, index) => (
            <div key={index} className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 p-3 bg-indigo-50 inline-block rounded-lg">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <TimePeriodProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/learn-more" element={<LearnMore />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Routes>
      </Router>
    </TimePeriodProvider>
  );
}

export default App;