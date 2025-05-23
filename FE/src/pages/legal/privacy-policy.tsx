import { NavBar } from '../../components/NavBar'

export default function PrivacyPolicy() {
    return (
        <div>
            <NavBar />
            <div className="min-h-screen pt-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
                        <div className="prose prose-indigo max-w-none">
                            <p className="text-gray-600 mb-6">Last updated on May 23, 2025</p>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                                <p className="text-gray-600 mb-4">
                                    Welcome to DigiPig. We respect your privacy and are committed to protecting your personal data.
                                    This privacy policy will inform you about how we look after your personal data when you visit our
                                    website and tell you about your privacy rights and how the law protects you.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Data We Collect</h2>
                                <p className="text-gray-600 mb-4">
                                    We may collect, use, store and transfer different kinds of personal data about you which we have
                                    grouped together as follows:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 mb-4">
                                    <li>Contact Data includes email address</li>
                                    <li>Technical Data includes internet protocol (IP) address, browser type and version, time zone setting and location</li>
                                    <li>Usage Data includes information about how you use our website and services</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Data</h2>
                                <p className="text-gray-600 mb-4">
                                    We will only use your personal data when the law allows us to. Most commonly, we will use your
                                    personal data in the following circumstances:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 mb-4">
                                    <li>To provide and maintain our service</li>
                                    <li>To notify you about changes to our service</li>
                                    <li>To provide customer support</li>
                                    <li>To gather analysis or valuable information so that we can improve our service</li>
                                    <li>To monitor the usage of our service</li>
                                    <li>To detect, prevent and address technical issues</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
                                <p className="text-gray-600 mb-4">
                                    We have put in place appropriate security measures to prevent your personal data from being
                                    accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition,
                                    we limit access to your personal data to those employees, agents, contractors and other third
                                    parties who have a business need to know.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Legal Rights</h2>
                                <p className="text-gray-600 mb-4">
                                    Under certain circumstances, you have rights under data protection laws in relation to your
                                    personal data, including the right to:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 mb-4">
                                    <li>Request access to your personal data</li>
                                    <li>Request correction of your personal data</li>
                                    <li>Request erasure of your personal data</li>
                                    <li>Object to processing of your personal data</li>
                                    <li>Request restriction of processing your personal data</li>
                                    <li>Request transfer of your personal data</li>
                                    <li>Right to withdraw consent</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
                                <p className="text-gray-600 mb-4">
                                    If you have any questions about this privacy policy or our privacy practices, please email us at
                                </p>
                                <p className="text-gray-600">
                                    privacy@digipig.com<br />
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 