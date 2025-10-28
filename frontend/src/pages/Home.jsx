import "./Home.css";

export default function Home() {
  return (
    <div className="home-root">
      <section className="hero">
        <div className="hero-overlay" />

        <div className="hero-content">
          <h1 className="hero-title">
            Build the schedule that actually works for you.
          </h1>

          <p className="hero-subtitle">
            Plan-A-Gator helps UF students track degree progress, check
            prerequisites, and map out every semester with confidence.
          </p>

          <div className="hero-ctas">
            <a className="hero-btn primary" href="/signin">
              Sign In
            </a>
            <a className="hero-btn secondary" href="/signup">
              Create Account
            </a>
          </div>

        </div>
      </section>

      <section className="features">
        <div className="features-inner">

          <div className="feature-card">
            <div className="feature-icon"></div>
            <h3 className="feature-title">Transcript–based planning</h3>
            <p className="feature-desc">
              Import the classes you’ve already taken and we check
              requirements you’ve completed. No spreadsheets. No guessing.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"></div>
            <h3 className="feature-title">Prereq & conflict checks</h3>
            <p className="feature-desc">
              We warn you if you're missing a prerequisite, or if two classes
              overlap in time. Build a clean, valid schedule from the start.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"></div>
            <h3 className="feature-title">Weekly schedule builder</h3>
            <p className="feature-desc">
              Drag and drop courses into a live weekly view. See your semester
              laid out hour by hour and save it for advising or future needs.
            </p>
          </div>

        </div>
      </section>

      <footer className="home-footer">
        <p className="footer-text">
          Built by students. Designed for Gators.
        </p>
      </footer>
    </div>
  );
}
