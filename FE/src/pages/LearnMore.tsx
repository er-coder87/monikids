import { useNavigate } from 'react-router-dom';
import { PlusCircle, Zap, Shield, BarChart3 } from 'lucide-react';
import { NavBar } from '../components/NavBar';

export default function LearnMore() {
    const navigate = useNavigate();

    const features = [
        {
            icon: <Zap className="w-6 h-6 text-indigo-600" />,
            title: "Create Expenses & Categorize",
            description: "Easily add expenses on the go and assign them to smart categories for better tracking."
        },
        {
            icon: <BarChart3 className="w-6 h-6 text-indigo-600" />,
            title: "Advanced Analytics",
            description: "ain clear insights into your spending habits with interactive charts."
        },
        {
            icon: <Shield className="w-6 h-6 text-indigo-600" />,
            title: "Security",
            description: "Your data is protected with enterprise-grade encryption and security measures."
        },
    ];

    const faqs = [
        {
            question: "Is Monikids free to use?",
            answer: "Yes! You can start tracking expenses for free. We also offer premium features for extra features such as bankstatement uploads, smart categorization, import and export expenses."
        },
        {
            question: "Is my financial data secure?",
            answer: "Absolutely. We use bsecure cloud infrastructure to protect your data."
        },
        {
            question: "Can I export my data?",
            answer: "Yes, your data is yours. You can export it anytime in CSV format."
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
                        Transform Your Expense Management
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        Discover how our platform helps individuals streamline their expense tracking,
                        improve financial visibility, and make better spending decisions.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
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
                        <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
                        <p className="text-lg text-indigo-100 mb-8">
                            Join thousands of tamariki who trust Monikids to track their expenses with confidence.
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
                                Contact
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
                                    <PlusCircle className="w-5 h-5 text-indigo-600 mr-3 flex-shrink-0" />
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