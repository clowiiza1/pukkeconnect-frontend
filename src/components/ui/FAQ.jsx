import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "What is Pukke Connect?",
      answer:
        "PukkeConnect is a web application designed to connect North-West University (NWU) students with societies that match their interests. It acts as a “society matchmaker,” helping students discover relevant groups and get involved in campus life.",
    },
    {
      question: "How does Pukke Connect work?",
      answer:
        "The platform uses a smart matchmaking system to recommend societies to students based on their interests and preferences. Users create profiles, indicate their areas of interest, and the system suggests societies that align with these interests.",
    },
    {
      question: "Why is Pukke Connect needed?",
      answer:
        "A 2023 study by Student Experience South Africa found that 68% of South African university students never join societies due to difficulties in finding relevant groups. Low participation limits student engagement and results in lost revenue for universities. PukkeConnect directly addresses this problem by making society discovery easier and more personalized.",
    },
    {
      question: "Is Pukke Connect unique in South Africa?",
      answer:
        "Yes. Currently, there is no comparable platform in African higher education institutions, giving NWU a first-mover advantage.",
    },
    {
      question: "How does Pukke Connect support the academic mission?",
      answer:
        "By involving students in the platform's development, PukkeConnect provides hands-on experience in building scalable, real-world software solutions, enhancing their academic and professional skills.",
    },
  ];

  return (
    <section id="faq" className="flex justify-center py-16 px-6 bg-white font-inter">
      <div className="max-w-6xl grid md:grid-cols-2 gap-12 items-start">
        {/* Header */}
        <div className="mt-8">
          <span className="inline-flex items-center text-sm font-medium text-mediumpur bg-softlav px-3 py-1 rounded-md mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5 stroke-mediumpur mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
              />
            </svg>
            Frequently asked questions
          </span>

          <h2 className="text-5xl font-normal text-dark mb-4">
            Frequently asked <span className="text-mediumpur"><br></br>questions</span>
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Find out how Pukke Connect works. Easy, transparent, and designed to
            help you discover, connect, and grow with the right societies.
          </p>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-xl border border-gray-300 overflow-hidden transition-all duration-300 ${
                activeIndex === index ? "bg-gray-50" : "bg-gray-100"
              }`}
            >
              <button
                className="w-full flex justify-between items-center text-left px-6 py-4 text-sm font-semibold text-dark cursor-pointer"
                onClick={() => toggleFAQ(index)}
              >
                {faq.question}
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-full bg-mediumpur text-white transition-transform duration-300 ${
                    activeIndex === index ? "rotate-45" : ""
                  }`}
                >
                  <FontAwesomeIcon
                    icon={activeIndex === index ? faMinus : faPlus}
                    className="text-xs"
                  />
                </span>
              </button>

              <div
                className={`px-6 text-gray-600 text-sm transition-all duration-300 ${
                  activeIndex === index
                    ? "max-h-40 py-4 bg-gray-50"
                    : "max-h-0 overflow-hidden"
                }`}
              >
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
