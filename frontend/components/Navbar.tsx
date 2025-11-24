"use client";

import React from "react";

const Navbar: React.FC = () => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style jsx>{`
        .navbar-wrapper {
          position: fixed;
          top: 25px;
          width: 100%;
          display: flex;
          justify-content: center;
          z-index: 1000;
        }

        .navbar {
          width: 88%;
          padding: 14px 35px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          /* ⭐ Enhanced Glass Effect */
          background: rgba(255, 251, 251, 0.49);
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-radius: 50px;
          border: none;
        }

        .brand {
          font-size: 28px;
          font-weight: 700;
          color: #1c1818ff;
        }

        .nav-links {
          display: flex;
          gap: 30px;
        }

        .nav-btn {
          background: none;
          border: none;
          color: #181010ff;
          font-size: 17px;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .nav-btn:hover {
          color: #90c8ff;
        }

        .auth-btns {
          display: flex;
          gap: 12px;
        }

        .signin-btn {
          padding: 10px 22px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 30px;
          border: none;
          color: white;
          backdrop-filter: blur(10px);
        }

        .signup-btn {
          padding: 10px 22px;
          background: #4a8cff;
          border-radius: 30px;
          border: none;
          color: white;
        }
      `}</style>

      <div className="navbar-wrapper">
        <nav className="navbar">
          <div className="brand">RideEase</div>

          <div className="nav-links">
            <button className="nav-btn" onClick={() => scrollToSection("hero")}>
              Home
            </button>
            <button className="nav-btn" onClick={() => scrollToSection("about")}>
              About
            </button>
            <button className="nav-btn" onClick={() => scrollToSection("gallery")}>
              Our Services
            </button>
          </div>

          <div className="auth-btns">
            <button className="signin-btn">Sign In</button>
            <button className="signup-btn">Sign Up</button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
