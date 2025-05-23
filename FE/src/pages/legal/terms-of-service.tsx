import { NavBar } from '../../components/NavBar'

export default function TermsOfService() {
    return (
        <div>
            <NavBar />
            <div className="min-h-screen pt-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
                        <div className="prose prose-indigo max-w-none">
                            <p className="text-gray-600 mb-6">Last updated on May 23, 2025</p>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
                                <p className="text-gray-600 mb-4">
                                    By accessing or using DigiPig (“the Service”), you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, please do not use the Service.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
                                <p className="text-gray-600 mb-4">
                                    Permission is granted to temporarily access the materials (information or software) on DigiPig Kids's
                                    website for personal, non-commercial transitory viewing only. This is the grant of a license,
                                    not a transfer of title, and under this license you may not:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 mb-4">
                                    <li>Modify or copy the materials</li>
                                    <li>Use the materials for any commercial purpose</li>
                                    <li>Attempt to decompile or reverse engineer any software contained on DigiPig's website</li>
                                    <li>Remove any copyright or other proprietary notations from the materials</li>
                                    <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Account</h2>
                                <p className="text-gray-600 mb-4">
                                    To access certain features of the website, you may be required to create an account. You are
                                    responsible for maintaining the confidentiality of your account information and for all activities
                                    that occur under your account. You agree to:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 mb-4">
                                    <li>Provide accurate and complete information when creating your account</li>
                                    <li>Update your information to keep it accurate and current</li>
                                    <li>Maintain the security of your account</li>
                                    <li>Notify us immediately of any unauthorized use of your account</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Content</h2>
                                <p className="text-gray-600 mb-4">
                                    You retain all rights to any content you submit, post or display on or through the service. By
                                    submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy,
                                    reproduce, process, adapt, modify, publish, transmit, display and distribute such content.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Disclaimer</h2>
                                <p className="text-gray-600 mb-4">
                                    The materials on DigiPig's website are provided on an 'as is' basis. DigiPig makes no
                                    warranties, expressed or implied, and hereby disclaims and negates all other warranties including,
                                    without limitation, implied warranties or conditions of merchantability, fitness for a particular
                                    purpose, or non-infringement of intellectual property or other violation of rights.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitations</h2>
                                <p className="text-gray-600 mb-4">
                                    In no event shall DigiPig or its suppliers be liable for any damages (including, without
                                    limitation, damages for loss of data or profit, or due to business interruption) arising out of
                                    the use or inability to use the materials on DigiPig's website.
                                </p>
                            </section>
                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Changes to Terms</h2>
                                <p className="text-gray-600 mb-4">
                                    We may update these Terms of Service occasionally. Continued use after changes means you accept the updated terms.
                                </p>
                            </section>
                            <section className="mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Information</h2>
                                <p className="text-gray-600 mb-4">
                                    If you have any questions about these Terms of Service, please email us at
                                </p>
                                <p className="text-gray-600">
                                    legal@digiPig.com<br />
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 