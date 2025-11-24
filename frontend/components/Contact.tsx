"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaUser, FaEnvelope, FaComment } from "react-icons/fa";

const Contact: React.FC = () => {
  const contactRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
          } else {
            setVisible(false);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (contactRef.current) {
      observer.observe(contactRef.current);
    }

    return () => {
      if (contactRef.current) {
        observer.unobserve(contactRef.current);
      }
    };
  }, []);

  return (
    <>
      <style jsx>{`
        #contact {
          padding: 100px 20px;
          background: #f4f7ff;
          color: #1f3a38;
        }

        .contact-container {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          gap: 50px;
          align-items: flex-start;
          opacity: 0;
          transform: translateY(50px);
          transition: all 0.8s ease;
        }

        .contact-container.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .contact-info {
          flex: 1;
          min-width: 300px;
        }

        .contact-info h2 {
          font-size: 36px;
          margin-bottom: 25px;
        }

        .contact-info p {
          font-size: 16px;
          line-height: 1.8;
          margin-bottom: 15px;
        }

        .contact-info .info-item {
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 16px;
          margin-bottom: 15px;
        }

        .contact-form {
          flex: 1;
          min-width: 300px;
          background: #fff;
          padding: 30px 25px;
          border-radius: 20px;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
        }

        .form-group {
          position: relative;
          margin-bottom: 20px;
        }

        .form-group svg {
          position: absolute;
          top: 50%;
          left: 15px;
          transform: translateY(-50%);
          color: #4a8cff;
        }

        .form-control {
          width: 100%;
          padding: 12px 15px 12px 45px;
          border-radius: 10px;
          border: 1px solid #ccc;
          transition: all 0.3s ease;
        }

        .form-control:focus {
          outline: none;
          border-color: #4a8cff;
          box-shadow: 0 0 8px rgba(74, 140, 255, 0.4);
        }

        .btn-submit {
          width: 100%;
          padding: 12px;
          border: none;
          background: #4a8cff;
          color: #fff;
          font-size: 18px;
          font-weight: 600;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-submit:hover {
          background: #3a6ecc;
        }

        @media (max-width: 768px) {
          .contact-container {
            flex-direction: column;
            gap: 30px;
          }
        }
      `}</style>

      <div id="contact" ref={contactRef}>
        <div className={`contact-container ${visible ? "visible" : ""}`}>
          <div className="contact-info">
            <h2>Contact Us</h2>
            <p>
              Have questions or need support? Reach out to us and we’ll get back to you as soon as possible.
            </p>
            <div className="info-item">
              <FaUser /> <span>RideEase, 123 Main Street, City</span>
            </div>
            <div className="info-item">
              <FaEnvelope /> <span>support@rideease.com</span>
            </div>
            <div className="info-item">
              <FaComment /> <span>+94 71 234 5678</span>
            </div>
          </div>

          <form className="contact-form">
            <div className="form-group">
              <FaUser />
              <input type="text" className="form-control" placeholder="Name" />
            </div>
            <div className="form-group">
              <FaEnvelope />
              <input type="email" className="form-control" placeholder="Email" />
            </div>
            <div className="form-group">
              <FaComment />
              <textarea className="form-control" rows={4} placeholder="Message"></textarea>
            </div>
            <button type="submit" className="btn-submit">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Contact;
