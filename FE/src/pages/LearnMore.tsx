import { useNavigate } from 'react-router-dom';
import { PiggyBank, BookOpen, Sparkles, Shield, BarChart3 } from 'lucide-react';
import { NavBar } from '../components/NavBar';

export default function LearnMore() {
    const navigate = useNavigate();

    const features = [
        {
            icon: <PiggyBank className="w-6 h-6 text-indigo-600" />,
            title: "Digital Piggybank",
            description: "Help your child learn to save with our interactive digital piggybank. Track savings, manage allowances, and celebrate financial milestones."
        },
        {
            icon: <BookOpen className="w-6 h-6 text-indigo-600" />,
            title: "Financial Education",
            description: "Build strong money habits through fun, interactive lessons and real-world practice. Make learning about money engaging and enjoyable."
        },
        {
            icon: <Sparkles className="w-6 h-6 text-indigo-600" />,
            title: "Kid-Friendly Design",
            description: "Simple, colorful, and engaging interface designed specifically for children. Makes learning about money fun and accessible."
        },
        {
            icon: <BarChart3 className="w-6 h-6 text-indigo-600" />,
            title: "Smart Tracking",
            description: "Monitor savings goals, track chore completion, and watch your child's financial literacy grow with easy-to-understand progress reports."
        },
    ];

    const faqs = [
        {
            question: "Is Monikids suitable for my child's age?",
            answer: "Monikids is designed for children ages 5-15, with features that grow with your child. Parents can customize the experience based on their child's age and understanding."
        },
        {
            question: "How does Monikids help teach financial literacy?",
            answer: "Through interactive features like the digital piggybank, chore rewards, and savings goals, children learn practical money management skills in a safe, controlled environment."
        },
        {
            question: "Can I monitor my child's progress?",
            answer: "Yes! Parents have full visibility into their child's savings, spending habits, and financial learning progress through an easy-to-use dashboard."
        },
        {
            question: "Is my child's financial data secure?",
            answer: "Absolutely. We use bank-level security measures to protect your child's financial information. Parents maintain full control over all transactions and settings."
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Navigation Bar */}
            <NavBar />
            <div className="container mx-auto px-4 pt-32 pb-20">
                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Teach Your Kids Smart Money Habits
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        Discover how Monikids helps parents teach their children about money through fun, interactive tools.
                        Build a strong foundation for financial literacy that will last a lifetime.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                            <div className="mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* Getting Started Section */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white mb-20">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-6">Start Your Child's Financial Journey</h2>
                        <p className="text-lg text-indigo-100 mb-8">
                            Join families who trust Monikids to teach their children about money in a fun and safe way.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/signup')}
                                className="px-8 py-3 bg-white text-indigo-600 rounded-full font-medium hover:bg-indigo-50 transition-colors"
                            >
                                Create Free Account
                            </button>
                            <button
                                onClick={() => navigate('/contact')}
                                className="px-8 py-3 bg-transparent border border-white text-white rounded-full font-medium hover:bg-white/10 transition-colors"
                            >
                                Contact Us
                            </button>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-4xl mx-auto">
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