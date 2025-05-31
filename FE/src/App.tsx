import piggybankKids from './assets/kids-with-piggybanks.jpg';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ArrowRight, PiggyBank, BookOpen, Sparkles, BarChart } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import UnauthorizedPage from './pages/UnauthorizedPage';
import PrivacyPolicy from './pages/legal/privacy-policy';
import TermsOfService from './pages/legal/terms-of-service';
import { NavBar } from './components/NavBar';
import { Footer } from './components/Footer';
import { PricingPage } from './pages/PricingPage';
import { SuccessPage } from './pages/SuccessPage';
import { useRegisterUser } from './hooks/useRegisterUser';
import VerifyEmailPage from './pages/VerifyEmailPage';
import LoginPage from './pages/LogInPage';
import useAuth from './hooks/useAuth';
import SignPage from './pages/SignPage';

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  useRegisterUser();

  const faqs = [
    {
      question: "Is DigiPiggy suitable for my child's age?",
      answer: "DigiPiggy is designed for kids aged 5 to 15, with features that adapt as your child grows. Parents can customize the experience to match their child's age and understanding."
    },
    {
      question: "How does DigiPiggy help teach financial literacy?",
      answer: "With interactive tools like the digital piggy bank, chore rewards, and savings goals, DigiPiggy helps children build real money skills in a safe and fun environment."
    },
    {
      question: "Is DigiPiggy connected to a bank or third-party provider?",
      answer: "No, DigiPiggy isn’t connected to any bank or external service. It works just like a traditional piggy bank—only digital and accessible through your devices. Parents set the allowance and give the money to their kids in person, keeping everything simple and under their control."
    },
    {
      question: "Is my child's financial data secure?",
      answer: "Absolutely. DigiPiggy uses high-standard security measures to protect your child’s information. Parents have full control over all transactions and settings. For more details, visit our Privacy Policy page."
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation Bar */}
      <NavBar />
      <div className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-10">
              Your Child's First
              <span className="text-pink-600"> Digital Piggy Bank</span>
            </h1>
            <h3 className="text-xl md:text-xl text-gray-700 mb-4">
              Kickstarting your child’s
              <span className="text-pink-400"> smart money journey</span>
            </h3>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              A digital piggy bank that makes saving fun—helping kids earn chore rewards and build smart money habits from the start!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={() => isAuthenticated ? navigate('dashboard') : navigate('pricing-page')}
                className="px-8 py-4 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors inline-flex items-center justify-center group"
              >
                Get Started
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
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
            Watch our quick demo to see how DigiPiggy helps you teach financial literacy to your children through fun and interactive piggybank management.
          </p>
          <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                className="w-full h-full"
                src=""
                title="Product Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
        {/* Features Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-6">
          {[
            {
              icon: <PiggyBank size={32} className="text-indigo-600" />,
              title: "Digital Piggy Bank",
              description: "Help your child learn to save with our interactive digital piggybank. Track savings, manage allowances, and celebrate financial milestones."
            },
            {
              icon: <BookOpen size={32} className="text-indigo-600" />,
              title: "Financial Education",
              description: "Build strong money habits through fun, interactive lessons and real-world practice. Make learning about money engaging and enjoyable."
            },
            {
              icon: <Sparkles size={32} className="text-indigo-600" />,
              title: "Kid-Friendly Interface",
              description: "Simple, colorful, and engaging interface designed specifically for children. Makes learning about money fun and accessible."
            },
            {
              icon: <BarChart size={32} className="text-indigo-600" />,
              title: "Smart Tracking",
              description: "Monitor savings goals, track chore completion, and watch your child's financial literacy grow with easy-to-understand progress reports."
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
        {/* FAQ Section */}
        <div className="mt-32 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <PiggyBank className="w-5 h-5 text-indigo-600 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </div>
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
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/pricing-page" element={<PricingPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/legal/terms-of-service" element={<TermsOfService />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;