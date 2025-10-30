import React, { useState } from "react";
import { Container, Section, Card, CardBody } from "../components/UIComponents";
import "./Help.css";

export default function Help() {
  const faqs = [
    {
      q: "How do I build my schedule?",
      a: "Go to the Scheduler page. On the left you'll see Available Courses. Click a course to view its details, then add it to an open time slot in your Weekly Schedule. We'll highlight time conflicts and missing prerequisites."
    },
    {
      q: "Why can't I add this class?",
      a: "Usually it's either (1) it overlaps with something already on your schedule, or (2) you're missing a required prerequisite. The course card will tell you which prereq you're missing."
    },
    {
      q: "How do I remove a class?",
      a: "In the Weekly Schedule grid, click the class block you want to remove. You'll get a small menu that lets you delete it from that time slot."
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
    <div className="help-page">
      <Container size="lg">
        <Section>
          <div className="help-container">
            <Card className="help-header-card">
              <CardBody>
                <div className="help-header">
                  <h1 className="help-title">Help & Frequently Asked Questions</h1>
                  <p className="help-subtitle">
                    Find answers to common questions about building your schedule,
                    tracking prerequisites, and saving your plan.
                  </p>
                </div>
              </CardBody>
            </Card>

            <div className="faq-section">
              {faqs.map((item, idx) => (
                <Card key={idx} className="faq-card">
                  <CardBody>
                    <div className="faq-item">
                      <button
                        className={`faq-question ${openIndex === idx ? 'active' : ''}`}
                        onClick={() => toggle(idx)}
                        aria-expanded={openIndex === idx}
                      >
                        <span className="faq-icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`faq-icon-svg ${openIndex === idx ? 'rotated' : ''}`}
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                        </span>
                        <span className="faq-question-text">{item.q}</span>
                        <span className="faq-arrow">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`arrow-svg ${openIndex === idx ? 'rotated' : ''}`}
                          >
                            <polyline points="6,9 12,15 18,9"></polyline>
                          </svg>
                        </span>
                      </button>

                      <div className={`faq-answer ${openIndex === idx ? 'show' : ''}`}>
                        <div className="faq-answer-content">
                          {item.a}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            <Card className="help-footer-card">
              <CardBody>
                <div className="help-footer">
                  <p className="help-footer-text">
                    Still need help? Try visiting the{" "}
                    <a
                      href="https://www.ufl.edu"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary"
                    >
                      University of Florida Homepage
                    </a>
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </Section>
      </Container>
    </div>
  );
}

  