import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

// --- Color Palette ---
const colors = {
  plum: '#6a0dad',      // Deep purple
  lilac: '#c4a7e7',     // Light accent
  mist: '#f3f4f6',      // Background gray for cards
  slate: '#1e293b',      // Text color
};

// --- Card Component ---
const Card = ({ title, subtitle, children }) => (
  <div className="max-w-3xl w-full p-8 bg-white shadow-2xl rounded-3xl border border-gray-100 transform transition-transform hover:-translate-y-1">
    <header className="text-center mb-10">
      <h1 className="text-4xl font-extrabold text-slate-800">{title}</h1>
      <p className="mt-2 text-gray-500 text-lg">{subtitle}</p>
    </header>
    {children}
  </div>
);

// --- Individual Contact Item ---
const ContactItem = ({ Icon, title, content, link }) => (
  <div
    className="flex items-start gap-4 p-4 rounded-xl hover:shadow-lg transition-shadow duration-300"
    style={{ backgroundColor: colors.mist }}
  >
    <div
      className="flex-shrink-0 p-3 rounded-full"
      style={{ backgroundColor: colors.lilac, color: colors.plum }}
    >
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h3 className="font-semibold text-gray-700">{title}</h3>
      {link ? (
        <a
          href={link}
          className="text-slate-800 font-medium hover:text-plum transition-colors duration-200 break-words"
        >
          {content}
        </a>
      ) : (
        <p className="text-slate-800 font-medium break-words">{content}</p>
      )}
    </div>
  </div>
);

// --- Main Contact Page ---
export default function ContactPage() {
  const contactInfo = [
    {
      title: 'General Email Support',
      content: 'support@pukkeconnect.edu',
      Icon: Mail,
      link: 'mailto:support@pukkeconnect.edu',
    },
    {
      title: 'Call Our Office',
      content: '+27 (018) 299-4111',
      Icon: Phone,
      link: 'tel:+27182994111',
    },
    {
      title: 'Physical Address',
      content: 'Building 5, University Lane, Potchefstroom, 2520',
      Icon: MapPin,
      link: 'https://maps.app.goo.gl/example',
    },
    {
      title: 'Office Hours',
      content: 'Mon - Fri: 8:00 AM - 4:30 PM',
      Icon: Clock,
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 sm:p-12 font-sans"
      style={{
        background: 'linear-gradient(to bottom, #f3e6ff 0%, #ffffff 40%)', 
      }}
    >
      <Card
        title="Contact PukkeConnect"
        subtitle="We're here to help! Reach out to the platform support team using the details below."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {contactInfo.map((item, index) => (
            <ContactItem
              key={index}
              Icon={item.Icon}
              title={item.title}
              content={item.content}
              link={item.link}
            />
          ))}
        </div>

        <div className="mt-10 text-center border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Need immediate assistance?
          </h3>
          <p className="text-gray-600 text-sm">
            For urgent matters, please use the phone number above. For all other queries, email is preferred.
          </p>
          <button
            onClick={() => console.log('Navigating to Support FAQs')}
            className="mt-4 px-6 py-2 rounded-xl font-medium shadow-md transition-transform transform hover:scale-105 hover:opacity-90 text-white bg-gradient-to-r from-[#6a0dad] to-[#c4a7e7]"
          >
            View Support FAQs
          </button>
        </div>
      </Card>
    </div>
  );
}
