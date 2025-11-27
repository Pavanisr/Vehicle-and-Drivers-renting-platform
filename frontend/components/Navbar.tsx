"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Navbar: React.FC = () => {
  const router = useRouter();
  const [showSignupDropdown, setShowSignupDropdown] = useState(false);

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
          position: relative;
        }

        .signin-btn {
          padding: 10px 22px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 30px;
          border: none;
          color: white;
          backdrop-filter: blur(10px);
          cursor: pointer;
        }

        .signup-btn {
          padding: 10px 22px;
          background: #4a8cff;
          border-radius: 30px;
          border: none;
          color: white;
          cursor: pointer;
          position: relative;
        }

        .signup-dropdown {
          position: absolute;
          top: 50px;
          right: 0;
          background: #fff;
          color: #2b3a67;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          min-width: 160px;
          overflow: hidden;
          z-index: 10;
        }

        .signup-dropdown button {
          padding: 12px 18px;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: 0.2s;
        }

        .signup-dropdown button:hover {
          background: #f0f4ff;
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
            <button className="signin-btn" onClick={() => router.push("/login")}>
              Sign In
            </button>

            <div>
              <button
                className="signup-btn"
                onClick={() => setShowSignupDropdown(!showSignupDropdown)}
              >
                Sign Up
              </button>

              {showSignupDropdown && (
                <div className="signup-dropdown">
                  <button onClick={() => router.push("/ownerReg")}>As Owner</button>
                  <button onClick={() => router.push("/driverReg")}>As Driver</button>
                  <button onClick={() => router.push("/customerReg")}>As Customer</button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
