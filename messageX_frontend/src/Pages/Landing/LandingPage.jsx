import "./LandingPage.css";
import bg from "../../assets/bg.png";
import { useState } from "react";
import LoginModal from "../Auth/LoginModal";

const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="logo">
          <img src="/messageX.png" alt="MessageX" />
          <h2>MessageX</h2>
        </div>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>

        <ul className="nav-links">
          <li>
            <a href="#home">Home</a>
          </li>
          <li>
            <a href="#about">About Us</a>
          </li>
          <li>
            <a href="#services">Features</a>
          </li>
          <li>
            <a href="#contact">Contact Us</a>
          </li>
        </ul>
      </nav>
      <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
        <div className="close-menu" onClick={() => setMenuOpen(false)}>
          ✕
        </div>

        <a href="#home" onClick={() => setMenuOpen(false)}>
          Home
        </a>
        <a href="#about" onClick={() => setMenuOpen(false)}>
          About Us
        </a>
        <a href="#services" onClick={() => setMenuOpen(false)}>
          Features
        </a>
        <a href="#contact" onClick={() => setMenuOpen(false)}>
          Contact Us
        </a>
      </div>

      <section className="hero" id="home">
        <div className="hero-content">
          <span className="badge">✨ A New Way to Connect</span>

          <h1>
            Connect.
            <br />
            Communicate.
            <br />
            <span>Collaborate.</span>
          </h1>

          <p>
            Experience seamless real-time messaging, secure conversations, and
            effortless collaboration with MessageX.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={() => setShowLogin(true)}>
              Get Started
            </button>
          </div>

          <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
        </div>

        <div className="hero-image">
          <img src={bg} alt="MessageX Hero" />
        </div>
      </section>

      <section className="about" id="about">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="about-title">About MessageX</h2>

            <p className="about-subtitle">
              MessageX is a modern communication platform designed to connect
              people, teams, and communities through secure and seamless
              conversations.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="about-card">
                <div className="icon-circle">🚀</div>

                <h3>Our Mission</h3>

                <p>
                  To make communication faster, smarter, and more accessible for
                  individuals, teams, and communities.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="about-card">
                <div className="icon-circle">🌎</div>

                <h3>Our Vision</h3>

                <p>
                  Building a connected world where collaboration and
                  communication happen seamlessly without barriers.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="about-card">
                <div className="icon-circle">⭐</div>

                <h3>Why MessageX?</h3>

                <p>
                  Modern design, secure messaging, real-time communication, and
                  a user-friendly experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="services" id="services">
        <h2>Key Features</h2>

        <div className="service-cards">
          <div className="card">
            <div className="icon">💬</div>

            <h3>Instant Messaging</h3>

            <p>
              Exchange messages instantly with low latency and a smooth chat
              experience.
            </p>
          </div>

          <div className="card">
            <div className="icon">👥</div>

            <h3>Group Chats</h3>

            <p>
              Create groups, manage conversations, and collaborate efficiently
              with your team.
            </p>
          </div>

          <div className="card">
            <div className="icon">🔔</div>

            <h3>Real-Time Notifications</h3>

            <p>
              Stay updated with instant message alerts and activity
              notifications.
            </p>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="about-title">Contact Us</h2>

            <p className="about-subtitle">
              Have questions? We're here to help.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="contact-card">
                <div className="icon-circle">📞</div>

                <h3>Phone</h3>

                <p>+91 9876543210</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="contact-card">
                <div className="icon-circle">📧</div>

                <h3>Email</h3>

                <p>support@messagex.com</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="contact-card">
                <div className="icon-circle">📍</div>

                <h3>Address</h3>

                <p>Visakhapatnam, Andhra Pradesh</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
