"use client";

import React from "react";
import Image from "next/image";

const Hero: React.FC = () => {
  return (
    <>
      <style jsx>{`
        .hero {
          position: relative;
          height: 90vh;
          width: 100%;
          overflow: hidden;
        }
        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.55);
        }
        .content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: #fff;
        }
        .title {
          font-size: 52px;
          font-weight: 700;
        }
        .subtitle {
          font-size: 20px;
          margin-top: 10px;
          white-space: nowrap;
          overflow: hidden;
          border-right: 2px solid #fff;
          width: 0;
          animation: typing 4s steps(60, end) forwards, blink 0.75s step-end infinite;
        }
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes blink {
          0%, 100% { border-color: transparent; }
          50% { border-color: #fff; }
        }
        .cta {
          margin-top: 20px;
          display: flex;
          gap: 20px;
          justify-content: center;
        }
        .btn-primary {
          background: #4a8cff;
          padding: 12px 25px;
          border-radius: 8px;
          border: none;
          color: white;
        }
        .btn-outline {
          border: 1px solid #fff;
          color: #fff;
          padding: 12px 25px;
          border-radius: 8px;
          background: none;
        }
      `}</style>

      <section id="hero" className="hero">
        <Image
          src="/hero.jpg"
          alt="Hero Image"
          fill
          priority
          style={{ objectFit: "cover" }}
        />

        <div className="overlay"></div>

        <div className="content">
          <h1 className="title">Rent Vehicles, Drivers, or Both Anytime, Anywhere</h1>
          <p className="subtitle">
            Choose your ride, hire a professional driver, or get the complete package for a hassle-free journey
          </p>

          <div className="cta">
            <button className="btn-primary">Read More</button>
            <button className="btn-outline">How We Work</button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
