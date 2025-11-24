"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

const About: React.FC = () => {
  const aboutRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Toggle visibility based on whether section is in viewport
          setVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.3 }
    );

    if (aboutRef.current) observer.observe(aboutRef.current);

    return () => {
      if (aboutRef.current) observer.unobserve(aboutRef.current);
    };
  }, []);

  return (
    <>
      <style jsx>{`
        .about {
          display: flex;
          flex-wrap: wrap;
          padding: 90px 40px;
          background: #fff;
          color: #1f3a38;
          gap: 40px;
        }

        /* Left column animation */
        .about-left {
          flex: 1;
          min-width: 300px;
          opacity: 0;
          transform: translateX(-50px);
          transition: all 1s ease;
        }

        .about-left.visible {
          opacity: 1;
          transform: translateX(0);
          transition-delay: 0.2s;
        }

        /* Right column grid */
        .about-right {
          flex: 1;
          min-width: 300px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 20px;
        }

        /* Image wrapper animation */
        .img-wrapper {
          width: 100%;
          height: 100%;
          opacity: 0;
          transform: scale(0.8) translateX(50px);
          transition: all 1s ease;
        }

        .img-wrapper.left {
          transform: scale(0.8) translateX(-50px);
        }

        /* Staggered animation for each image */
        .img-wrapper.visible:nth-child(1) {
          transition-delay: 0.3s;
          opacity: 1;
          transform: scale(1) translateX(0);
        }
        .img-wrapper.visible:nth-child(2) {
          transition-delay: 0.5s;
          opacity: 1;
          transform: scale(1) translateX(0);
        }
        .img-wrapper.visible:nth-child(3) {
          transition-delay: 0.7s;
          opacity: 1;
          transform: scale(1) translateX(0);
        }
        .img-wrapper.visible:nth-child(4) {
          transition-delay: 0.9s;
          opacity: 1;
          transform: scale(1) translateX(0);
        }

        /* Text styling */
        .title {
          font-size: 38px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .text {
          font-size: 18px;
          line-height: 1.6;
          margin-bottom: 30px;
        }

        .highlights {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .highlight-item h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .highlight-item p {
          font-size: 16px;
          line-height: 1.4;
        }

        .learn-more-btn {
          margin-top: 20px;
          padding: 10px 25px;
          border-radius: 8px;
          border: none;
          background-color: #4a8cff;
          color: #fff;
          cursor: pointer;
        }
      `}</style>

      <section id="about" className="about" ref={aboutRef}>
        {/* Left Text Column */}
        <div className={`about-left ${visible ? "visible" : ""}`}>
            <h1>About Us</h1><br></br>
          <h3 className="title">Your Trusted Partner for On-Demand Transportation</h3>

          <p className="text">
            At <strong>RideEase</strong>, we make transportation simple and convenient. Whether you need a vehicle, a professional driver, or both, we offer flexible rental solutions to match your needs. Our fleet is well-maintained, our drivers are experienced, and our booking process is fast and secure. Travel with comfort, reliability, and peace of mind.
          </p>

          <div className="highlights">
            <div className="highlight-item">
              <h3>1. 24/7 Availability</h3>
              <p>Book anytime, anywhere for your convenience.</p>
            </div>
            <div className="highlight-item">
              <h3>2. Safety & Quality</h3>
              <p>Strict checks on vehicles and drivers.</p>
            </div>
            <div className="highlight-item">
              <h3>3. Wide Fleet Options</h3>
              <p>Cars, bikes, vans, and more for all needs.</p>
            </div>
            <div className="highlight-item">
              <h3>4. Service Areas</h3>
              <p>Reliable service across multiple regions.</p>
            </div>
          </div>

          <button className="learn-more-btn">Learn More</button>
        </div>

        {/* Right Images Column */}
        <div className="about-right">
          <div className={`img-wrapper left ${visible ? "visible" : ""}`}>
            <Image src="/driver.jpg" alt="Driver" width={300} height={200} />
          </div>
          <div className={`img-wrapper ${visible ? "visible" : ""}`}>
            <Image src="/drivvehi.jpg" alt="Driver Vehicle" width={300} height={200} />
          </div>
          <div className={`img-wrapper ${visible ? "visible" : ""}`}>
            <Image src="/vehi.jpg" alt="Vehicle" width={300} height={200} />
          </div>
          <div className={`img-wrapper left ${visible ? "visible" : ""}`}>
            <Image src="/driver.jpg" alt="Driver 2" width={300} height={200} />
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
