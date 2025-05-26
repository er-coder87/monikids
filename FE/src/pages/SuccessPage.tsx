import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "../components/NavBar"; // Adjust path as needed

export const SuccessPage = () => {
    const [plan, setPlan] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // useEffect(() => {
    //     const sessionId = new URLSearchParams(window.location.search).get("session_id");

    //     if (!sessionId) {
    //         navigate("/"); // Redirect to home if no session ID
    //         return;
    //     }

    //     fetch(`/api/stripe/session-details?sessionId=${sessionId}`)
    //         .then((res) => {
    //             if (!res.ok) throw new Error("Failed to fetch session details");
    //             return res.json();
    //         })
    //         .then((data) => {
    //             setPlan(data.plan || "your plan");
    //         })
    //         .catch(() => {
    //             setPlan(null);
    //         })
    //         .finally(() => setLoading(false));
    // }, [navigate]);

    return (
        <>
            <NavBar />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-24 px-4">
                <div className="max-w-xl text-center bg-white shadow-lg p-10 rounded-2xl border border-gray-100">
                    {loading ? (
                        <div className="text-gray-500 text-lg">Processing your subscription...</div>
                    ) : plan ? (
                        <>
                            <h1 className="text-4xl font-bold text-green-600 mb-4">Success! 🎉</h1>
                            <p className="text-xl text-gray-700 mb-2">
                                You're now subscribed to the <span className="font-semibold">{plan}</span> plan.
                            </p>
                            <p className="text-gray-500">Enjoy full access to all the features!</p>
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                            >
                                Go to Dashboard
                            </button>
                        </>
                    ) : (
                        <div className="text-red-500 text-lg">Something went wrong. Please contact support.</div>
                    )}
                </div>
            </div>
        </>
    );
};
