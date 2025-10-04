import React from 'react';
import { Users, Target, TrendingUp, Award } from 'lucide-react';

// --- Color Palette ---
const colors = {
  plum: '#6a509b',      // Deep purple
  lilac: '#ac98cd',     // Light accent
  mist: '#f3f4f6',      // Background gray for cards
  slate: '#1e293b',     // Text color
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

// --- Individual Info Item ---
const InfoItem = ({ Icon, title, content }) => (
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
      <p className="text-slate-800 font-medium break-words">{content}</p>
    </div>
  </div>
);

// --- Main About Page ---
export default function AboutPage() {
  const aboutInfo = [
    {
      title: 'Our Mission',
      content: 'To connect NWU students with societies that match their interests, fostering a vibrant campus community.',
      Icon: Target,
    },
    {
      title: 'Student Focused',
      content: 'Built by students, for students. PukkeConnect bridges the gap between societies and potential members.',
      Icon: Users,
    },
    {
      title: 'Growing Platform',
      content: '500+ students matched with societies across Mafikeng, Potchefstroom, and Vanderbijlpark campuses.',
      Icon: TrendingUp,
    },
    {
      title: 'Excellence',
      content: 'Recognized for innovation in student engagement and society visibility at North-West University.',
      Icon: Award,
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 sm:p-12 font-sans"
      style={{
        background: 'linear-gradient(to bottom, #ac98cd 0%, #ffffff 40%)',
      }}
    >
      <Card
        title="About PukkeConnect"
        subtitle="Bridging the gap between students and societies at North-West University"
      >
        <div className="mb-8 text-center">
          <p className="text-gray-700 leading-relaxed">
            PukkeConnect is a digital platform designed to solve the visibility gap between
            NWU students and campus societies. We empower students to discover, join, and engage
            with societies that align with their interests and passions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {aboutInfo.map((item, index) => (
            <InfoItem
              key={index}
              Icon={item.Icon}
              title={item.title}
              content={item.content}
            />
          ))}
        </div>

        <div className="mt-10 text-center border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Join the Community
          </h3>
          <p className="text-gray-600 text-sm">
            Whether you're a student looking for your perfect society or a society admin
            seeking new members, PukkeConnect is here to help you connect.
          </p>
        </div>
      </Card>
    </div>
  );
}
