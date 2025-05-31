import { useNavigate } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import useAuth from '../hooks/useAuth';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';
import { apiClient } from '../services/ApiClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Plan {
    id: string;
    stripePriceId?: string;
    name: string;
    price: string;
    features: string[];
    isTrial: boolean;
    disabled: boolean;
}

const plans: Plan[] = [
    {
        id: 'trial',
        stripePriceId: 'price_1RSpOoQ2iwAxYJkKXFwyVrYw',
        name: 'Trial',
        price: 'Free for 30 days',
        features: [
            'Track chores',
            'Chores and good deeds tracking',
            'Savings and expenses tracking',
        ],
        isTrial: true,
        disabled: false,
    },
    {
        id: 'basic',
        stripePriceId: 'your_stripe_basic_price_id',
        name: 'Basic',
        price: '$1.99/mo',
        features: [
            'Track chores',
            'Chores and good deeds tracking',
            'Savings and expenses tracking',
        ],
        isTrial: false,
        disabled: true,
    },
    {
        id: 'premium',
        stripePriceId: 'your_stripe_premium_price_id',
        name: 'Premium',
        price: '$3.99/mo',
        features: [
            'Everything in Basic',
            'Invite upto 3 users',
        ],
        isTrial: false,
        disabled: true,
    },
];

export function PricingPage() {
    const { isAuthenticated, supabaseClient } = useAuth();
    const navigate = useNavigate();
    const [loadingCheckout, setLoadingCheckout] = useState(false);

    const handleSelectPlan = async (plan: Plan) => {
        if (plan.disabled) return;

        if (!isAuthenticated) {
            navigate('/login?redirect=/pricing-page');
            return;
        }

        setLoadingCheckout(true);

        try {
            const stripe = await stripePromise;
            const { data: sessionData } = await supabaseClient.auth.getSession();
            const token = sessionData?.session?.access_token || '';

            if (!token) {
                console.error('No access token found.');
                setLoadingCheckout(false);
                return;
            }

            const response = await apiClient.post<{ sessionId: string }>(
                '/checkout',
                { priceId: plan.stripePriceId },
                token
            );

            if (response.error) {
                console.error('Error creating Checkout Session:', response.error);
                setLoadingCheckout(false);
                // Handle error (e.g., display a message to the user)
                return;
            }

            const { sessionId } = response.data!;

            if (stripe) {
                const { error } = await stripe.redirectToCheckout({
                    sessionId,
                });

                if (error) {
                    console.error('Error redirecting to Stripe Checkout:', error);
                    setLoadingCheckout(false);
                    // Handle error
                }
            } else {
                console.error('Stripe.js failed to load.');
                setLoadingCheckout(false);
            }
        } catch (error) {
            console.error('Error during checkout initiation:', error);
            setLoadingCheckout(false);
            // Handle error
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8">
            <NavBar />
            <div className="container mx-auto px-4 py-20">
                <h1 className="text-4xl font-extrabold text-indigo-600 mb-12">Choose Your Plan</h1>
                <div className="max-w-6xl w-full grid grid-cols-1 sm:grid-cols-3 gap-10">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative bg-white rounded-xl shadow-lg p-8 flex flex-col justify-between transition-transform
                                ${plan.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.03]'}
                            `}
                            aria-disabled={plan.disabled}
                        >
                            {plan.isTrial && (
                                <div className="absolute top-5 right-5 bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase px-3 py-1 rounded-full tracking-wide shadow-sm select-none">
                                    Limited Time
                                </div>
                            )}
                            <div>
                                <h2 className={`text-3xl font-extrabold mb-2 ${plan.isTrial ? 'text-indigo-700' : 'text-gray-900'}`}>
                                    {plan.name}
                                </h2>
                                <p className={`text-indigo-600 text-2xl font-extrabold`}>
                                    {plan.price}
                                </p>
                                <ul className="mt-6 space-y-3 text-gray-600">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center">
                                            <svg
                                                className={`w-5 h-5 mr-2 flex-shrink-0 ${plan.disabled ? 'text-gray-400' : 'text-indigo-500'}`}
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button
                                onClick={() => handleSelectPlan(plan)}
                                disabled={plan.disabled || loadingCheckout}
                                className={`mt-8 w-full py-3 rounded-full font-semibold transition-colors
                                    ${plan.disabled || loadingCheckout
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'}
                                `}
                            >
                                {loadingCheckout ? 'Redirecting...' : plan.disabled ? 'Coming Soon' : plan.isTrial ? 'Start Trial' : `Select ${plan.name}`}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}