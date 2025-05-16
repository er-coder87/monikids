import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ArrowRight, Wallet, PieChart, Clock, Shield } from 'lucide-react';
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
              Track smarter.
              <span className="text-indigo-600"> Save better.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Track smarter and save better with our intelligent expense tracking solution — simple, secure, and built for your peace of mind.
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
                src="https://images.pexels.com/photos/7821486/pexels-photo-7821486.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt="Financial dashboard"
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
            Watch our quick demo to see how Monikids helps you manage expenses, track budgets, and make better financial decisions.
          </p>
          <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                className="w-full h-full"
                // TODO - update below link
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
              icon: <Wallet size={32} className="text-indigo-600" />,
              title: "Expense Tracking",
              description: "Automatically categorize and track all your expenses in real-time"
            },
            {
              icon: <PieChart size={32} className="text-indigo-600" />,
              title: "Smart Analytics",
              description: "Get insights into your spending patterns with detailed reports"
            },
            {
              icon: <Clock size={32} className="text-indigo-600" />,
              title: "Budget Planning",
              description: "Set and manage budgets to reach your financial goals faster"
            },
            {
              icon: <Shield size={32} className="text-indigo-600" />,
              title: "Secure Platform",
              description: "Bank-level security to keep your financial data protected"
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
        {/* Pricing Section */}
        <div className="mt-32 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Choose the plan that best fits your needs. All plans include our core features.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Basic",
                price: "Free",
                description: "Perfect for getting started",
                features: [
                  "Track up to 50 transactions",
                  "Basic expense categories",
                  "Monthly reports",
                  "Email support"
                ]
              },
              {
                name: "Pro",
                price: "$9.99",
                period: "/month",
                description: "Best for individuals",
                features: [
                  "Unlimited transactions",
                  "Advanced expense categories",
                  "Real-time analytics",
                  "Priority support",
                  "Custom budget alerts",
                  "Export to CSV/PDF"
                ],
                highlighted: true
              },
              {
                name: "Enterprise",
                price: "$29.99",
                period: "/month",
                description: "For businesses",
                features: [
                  "Everything in Pro",
                  "Team collaboration",
                  "Advanced reporting",
                  "API access",
                  "Dedicated account manager",
                  "Custom integrations"
                ]
              }
            ].map((plan, index) => (
              <div
                key={index}
                className={`p-8 rounded-2xl ${plan.highlighted
                  ? "bg-indigo-600 text-white shadow-xl scale-105"
                  : "bg-white text-gray-900 shadow-lg"
                  }`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className={`text-lg ${plan.highlighted ? "text-indigo-100" : "text-gray-600"}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={`mb-6 ${plan.highlighted ? "text-indigo-100" : "text-gray-600"}`}>
                  {plan.description}
                </p>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <svg
                        className={`w-5 h-5 mr-2 ${plan.highlighted ? "text-indigo-200" : "text-indigo-600"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 px-6 rounded-full font-medium transition-all duration-200 ${plan.highlighted
                    ? "bg-white text-indigo-600 hover:bg-indigo-50 hover:shadow-lg"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg"
                    }`}
                >
                  Select
                </button>
              </div>
            ))}
          </div>
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