import React from 'react';
import { Shield, Lock, Eye, UserCheck, FileText, CheckCircle, UserX, Users, Building, Copyright, Scale, Edit, XCircle, Phone, Gavel, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Color Palette ---
const colors = {
  plum: '#6a509b',
  lilac: '#ac98cd',
  mist: '#f3f4f6',
  slate: '#1e293b',
};

export default function TermsPage() {
  const navigate = useNavigate();

  const handleBackToSignup = () => {
    navigate('/?auth=register');
  };

  return (
    <div
      className="min-h-screen py-12 px-6 sm:px-12 font-sans"
      style={{
        background: 'linear-gradient(to bottom, #ac98cd 0%, #ffffff 40%)',
      }}
    >
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl border border-gray-100 p-8 sm:p-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-800">Terms & Conditions</h1>
          <p className="mt-2 text-gray-500 text-lg">Last Updated: October 2025</p>
        </header>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          {/* Introduction */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-6 h-6" style={{ color: colors.plum }} />
              <h2 className="text-2xl font-bold text-slate-800">1. Introduction</h2>
            </div>
            <p>
              Welcome to PukkeConnect. By accessing or using our platform, you agree to be bound by these Terms and Conditions.
              PukkeConnect is a digital matchmaking platform designed to connect North-West University (NWU) students with
              campus societies based on their interests and preferences.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6" style={{ color: colors.plum }} />
              <h2 className="text-2xl font-bold text-slate-800">2. Acceptance of Terms</h2>
            </div>
            <p>
              By registering for an account, you acknowledge that you have read, understood, and agree to be bound by these
              Terms and Conditions. If you do not agree with any part of these terms, you must not use the platform.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <UserX className="w-6 h-6" style={{ color: colors.plum }} />
              <h2 className="text-2xl font-bold text-slate-800">3. Eligibility</h2>
            </div>
            <p>
              PukkeConnect is exclusively available to current students of North-West University. You must provide accurate
              and complete information during registration, including a valid student number and NWU email address.
            </p>
          </section>

          {/* Data Collection & Privacy */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <Lock className="w-6 h-6" style={{ color: colors.plum }} />
              <h2 className="text-2xl font-bold text-slate-800">4. Data Collection & Privacy</h2>
            </div>
            <div className="space-y-3">
              <p className="font-semibold">We collect and process the following information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Personal Information:</strong> Name, surname, student number, email address, phone number</li>
                <li><strong>Academic Information:</strong> Major/field of study, campus location</li>
                <li><strong>Interest Data:</strong> Quiz responses, society preferences, interaction history</li>
                <li><strong>Usage Data:</strong> Platform activity, RSVP history, membership records</li>
              </ul>
              <p className="mt-3">
                Your data is used solely to provide personalized society recommendations and improve your experience on PukkeConnect.
                We do not sell or share your personal information with third parties without your consent.
              </p>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6" style={{ color: colors.plum }} />
              <h2 className="text-2xl font-bold text-slate-800">5. User Responsibilities</h2>
            </div>
            <p>As a user of PukkeConnect, you agree to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>Provide accurate and truthful information</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Use the platform respectfully and in accordance with NWU policies</li>
              <li>Not engage in harassment, discrimination, or inappropriate behavior</li>
              <li>Not attempt to access unauthorized areas of the platform</li>
            </ul>
          </section>

          {/* Society Memberships */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <Building className="w-6 h-6" style={{ color: colors.plum }} />
              <h2 className="text-2xl font-bold text-slate-800">6. Society Memberships</h2>
            </div>
            <p>
              Society membership requests are subject to approval by society administrators. PukkeConnect facilitates
              connections but does not guarantee membership acceptance. Each society maintains its own membership criteria
              and policies.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <Copyright className="w-6 h-6" style={{ color: colors.plum }} />
              <h2 className="text-2xl font-bold text-slate-800">7. Intellectual Property</h2>
            </div>
            <p>
              All content, features, and functionality on PukkeConnect are owned by the platform and protected by
              international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6" style={{ color: colors.plum }} />
              <h2 className="text-2xl font-bold text-slate-800">8. Data Security</h2>
            </div>
            <p>
              We implement industry-standard security measures to protect your personal information. However, no method of
              transmission over the internet is 100% secure. You acknowledge that you provide information at your own risk.
            </p>
          </section>

          {/* User Rights */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <UserCheck className="w-6 h-6" style={{ color: colors.plum }} />
              <h2 className="text-2xl font-bold text-slate-800">9. Your Rights</h2>
            </div>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>Access your personal data stored on the platform</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and associated data</li>
              <li>Withdraw consent for data processing at any time</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <Scale className="w-6 h-6" style={{ color: colors.plum }} />
              <h2 className="text-2xl font-bold text-slate-800">10. Limitation of Liability</h2>
            </div>
            <p>
              PukkeConnect is provided "as is" without warranties of any kind. We are not liable for any damages arising
              from your use of the platform, including but not limited to issues with society interactions, event attendance,
              or recommendation accuracy.
            </p>
          </section>

          {/* Modifications */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <Edit className="w-6 h-6" style={{ color: colors.plum }} />
              <h2 className="text-2xl font-bold text-slate-800">11. Changes to Terms</h2>
            </div>
            <p>
              We reserve the right to modify these Terms and Conditions at any time. Users will be notified of significant
              changes via email or platform notifications. Continued use of the platform after changes constitutes acceptance
              of the updated terms.
            </p>
          </section>

          {/* Termination */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <XCircle className="w-6 h-6" style={{ color: colors.plum }} />
              <h2 className="text-2xl font-bold text-slate-800">12. Account Termination</h2>
            </div>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms and Conditions or engage in
              behavior harmful to the platform or other users. You may also request account deletion at any time through
              your profile settings.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mt-10 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Phone className="w-6 h-6" style={{ color: colors.plum }} />
              <h2 className="text-2xl font-bold text-slate-800">13. Contact Us</h2>
            </div>
            <p>
              If you have questions about these Terms and Conditions or your data, please contact us at:
            </p>
            <div className="mt-3 text-purple-700 font-medium">
              <p>Email: support@pukkeconnect.edu</p>
              <p>Phone: +27 (018) 299-4111</p>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <Gavel className="w-6 h-6" style={{ color: colors.plum }} />
              <h2 className="text-2xl font-bold text-slate-800">14. Governing Law</h2>
            </div>
            <p>
              These Terms and Conditions are governed by the laws of the Republic of South Africa. Any disputes shall be
              subject to the exclusive jurisdiction of South African courts.
            </p>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-10 p-4 bg-purple-50 rounded-xl border border-purple-200">
          <p className="text-sm text-gray-600 text-center">
            By using PukkeConnect, you acknowledge that you have read and understood these Terms and Conditions and agree
            to comply with all applicable laws and regulations.
          </p>
        </div>

        {/* Back to Signup Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleBackToSignup}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium shadow-md transition-transform transform hover:scale-105 hover:opacity-90 text-white"
            style={{ background: colors.plum }}
          >
            <ArrowLeft size={20} />
            Back to Signup
          </button>
        </div>
      </div>
    </div>
  );
}
