"use client";
import React, { useEffect, useRef, useState } from "react";

const Footer: React.FC = () => {
  const footerRef = useRef<HTMLDivElement>(null);
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

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  return (
    <>
      <style jsx>{`
        footer {
          background: linear-gradient(135deg, #4a8cff, #1f3a38);
          color: #fff;
          padding: 50px 20px;
          text-align: center;
          opacity: 0;
          transform: translateY(50px);
          transition: all 0.8s ease;
        }

        footer.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .social-icons {
          margin: 20px 0;
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        .social-icons a {
          color: #fff;
          font-size: 24px;
          transition: transform 0.3s ease, color 0.3s ease;
        }

        .social-icons a:hover {
          transform: scale(1.2);
          color: #ffd700;
        }

        p {
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .social-icons a {
            font-size: 20px;
          }
        }
      `}</style>

      <footer ref={footerRef} className={visible ? "visible" : ""}>
        <div className="footer-container">
          <div className="social-icons">
            <a href="#" aria-label="Facebook">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2c0-2 1-3 3-3h2v3h-2c-1 0-1 .5-1 1v1h3l-1 3h-2v7A10 10 0 0 0 22 12z" />
              </svg>
            </a>
            <a href="#" aria-label="Twitter">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path d="M22.46 6c-.77.35-1.6.59-2.46.69a4.27 4.27 0 0 0 1.88-2.36 8.42 8.42 0 0 1-2.7 1.03 4.22 4.22 0 0 0-7.18 3.85 12 12 0 0 1-8.7-4.41 4.2 4.2 0 0 0 1.31 5.64 4.2 4.2 0 0 1-1.91-.53v.05a4.22 4.22 0 0 0 3.39 4.13 4.25 4.25 0 0 1-1.9.07 4.23 4.23 0 0 0 3.95 2.93A8.47 8.47 0 0 1 2 19.54 11.94 11.94 0 0 0 8.29 21c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.35-.02-.53A8.36 8.36 0 0 0 22.46 6z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zm8.75 1a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
              </svg>
            </a>
          </div>
          <p>&copy; {new Date().getFullYear()} RideEase. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
