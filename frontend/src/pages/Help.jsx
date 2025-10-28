import { useState } from "react";
import { Link } from "react-router-dom";
import "./Help.css";

export default function Help() {
  const faqs = [
    {
      q: "How do I build my schedule?",
      a: "Go to the Scheduler page. On the left you’ll see Available Courses. Click a course to view its details, then add it to an open time slot in your Weekly Schedule. We’ll highlight time conflicts and missing prerequisites."
    },
    {
      q: "Why can't I add this class?",
      a: "Usually it's either (1) it overlaps with something already on your schedule, or (2) you're missing a required prerequisite. The course card will tell you which prereq you're missing."
    },
    {
      q: "How do I remove a class?",
      a: "In the Weekly Schedule grid, click the class block you want to remove. You’ll get a small menu that lets you delete it from that time slot."
    },
    {
      q: "Does Plan-A-Gator save my schedule?",
      a: "Yes. When you click Save Schedule, we store your current layout so you can come back later. It will also be saved in a PDF."
    },
    {
      q: "Can I get suggestions for what to take next?",
      a: "Yes — the recommendation engine looks at remaining core requirements, open electives, and what you've already taken. It can prioritize classes that don't conflict in time."
    },
    {
      q: "Who can I contact for more help?",
      a: "If something looks wrong (missing courses, incorrect prereqs, etc.), reach out to your advising team or check the University of Florida."
    },
  ];

  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="help-wrapper">      

      <div className="help-container">
        <div className="help-header-card-alt">
          <h1 className="help-header-title">Help & Frequently Asked Questions</h1>
          <p className="help-header-lead">
            Find answers to common questions about building your schedule,
            tracking prerequisites, and saving your plan.
          </p>
        </div>
        <div className="faq-accordion">
          {faqs.map((item, idx) => (
            <div className="faq-accordion-item" key={idx}>
              <h2 className="faq-accordion-header">
                <button
                  className={
                    "faq-accordion-button " +
                    (openIndex === idx ? "" : "collapsed")
                  }
                  onClick={() => toggle(idx)}
                  aria-expanded={openIndex === idx}
                >
                  <span className="faq-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </span>
                  <span className="faq-question-text">{item.q}</span>
                </button>
              </h2>

              <div
                className={
                  "faq-accordion-collapse " +
                  (openIndex === idx ? "show" : "")
                }
              >
                <div className="faq-accordion-body">{item.a}</div>
              </div>
            </div>
          ))}
        </div>

        <hr className="faq-separator" />

        <div className="faq-footer-note">
          <p className="faq-footer-muted">
            Still need help? Try visiting the University Of Florida Homepage
          </p>
        </div>
      </div>
    </div>
  );
}

  