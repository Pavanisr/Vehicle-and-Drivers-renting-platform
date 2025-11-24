"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

const Gallery: React.FC = () => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [visibleServiceIndexes, setVisibleServiceIndexes] = useState<number[]>([]);
  const [visibleHighlightIndexes, setVisibleHighlightIndexes] = useState<number[]>([]);

  const services = [
    {
      title: "Vehicle Rentals",
      description:
        "Choose from a wide range of well-maintained vehicles to suit your needs. Whether it’s for a short trip, a weekend getaway, or a business requirement, we have the right vehicle for you.",
      img: "/vehi.jpg",
    },
    {
      title: "Professional Drivers",
      description:
        "Need someone to drive for you? Our experienced and trustworthy drivers ensure you reach your destination safely and on time.",
      img: "/driver.jpg",
    },
    {
      title: "Vehicles with Drivers",
      description:
        "For complete convenience, rent a vehicle along with a skilled driver. Focus on your journey while we handle the driving.",
      img: "/drivvehi.jpg",
    },
  ];

  const highlights = [
    {
      title: "Flexible Rental Plans",
      description: "Choose rental plans that fit your schedule and needs.",
    },
    {
      title: "Reliable & Safe Vehicles",
      description: "Well-maintained vehicles ensuring comfort and security.",
    },
    {
      title: "Professional Drivers",
      description: "Experienced drivers for safe and timely travel.",
    },
    {
      title: "Easy Booking & Transparent Pricing",
      description: "Fast booking process with clear, upfront pricing.",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"));
          const type = entry.target.getAttribute("data-type");

          if (entry.isIntersecting) {
            // Staggered animation
            setTimeout(() => {
              if (type === "service") {
                setVisibleServiceIndexes((prev) => [...new Set([...prev, index])]);
              } else if (type === "highlight") {
                setVisibleHighlightIndexes((prev) => [...new Set([...prev, index])]);
              }
            }, index * 200);
          } else {
            if (type === "service") {
              setVisibleServiceIndexes((prev) => prev.filter((i) => i !== index));
            } else if (type === "highlight") {
              setVisibleHighlightIndexes((prev) => prev.filter((i) => i !== index));
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    if (galleryRef.current) {
      const elements = galleryRef.current.querySelectorAll(".service, .highlight-item");
      elements.forEach((el) => observer.observe(el));
    }

    return () => {
      if (galleryRef.current) {
        const elements = galleryRef.current.querySelectorAll(".service, .highlight-item");
        elements.forEach((el) => observer.unobserve(el));
      }
    };
  }, []);

  return (
    <>
      <style jsx>{`
        .gallery {
          padding: 80px 40px;
          background: #f9f9f9;
          color: #1f3a38;
        }

        .title {
          text-align: center;
          font-size: 40px;
          font-weight: 700;
          margin-bottom: 15px;
        }

        .subtitle {
          text-align: center;
          font-size: 18px;
          max-width: 800px;
          margin: 0 auto 60px auto;
          line-height: 1.6;
          color: #4a4a4a;
        }

        .grid {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 80px;
        }

        .service {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 300px;
          opacity: 0;
          transform: translateY(50px) scale(0.8);
          transition: all 0.8s ease;
        }

        .service.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .circle {
          width: 250px;
          height: 250px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          position: relative;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .circle:hover {
          transform: scale(1.1);
          box-shadow: 0 15px 25px rgba(0, 0, 0, 0.25);
        }

        .circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .service h3 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #1f3a38;
        }

        .service p {
          font-size: 16px;
          line-height: 1.5;
          color: #555;
        }

        /* Highlights section with colored background */
        .highlights-container {
          background: #4a8cff;
          color: #fff;
          padding: 60px 40px;
          margin-top: 70px;
          border-radius: 20px;
        }

        .highlights {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 25px;
          text-align: center;
        }

        .highlight-item {
          opacity: 0;
          transform: translateY(50px);
          transition: all 0.8s ease;
        }

        .highlight-item.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .highlight-item h4 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .highlight-item p {
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .circle {
            width: 200px;
            height: 200px;
          }

          .grid {
            gap: 50px;
          }
        }

        @media (max-width: 480px) {
          .circle {
            width: 180px;
            height: 180px;
          }
        }
      `}</style>

      <div id="gallery" className="gallery" ref={galleryRef}>
        <h2 className="title">Our Services</h2>
        <p className="subtitle">
          At <strong>RideEase</strong>, we make travel easy, convenient, and hassle-free. Whether you need a vehicle for personal use, a professional driver, or a complete package with both, we’ve got you covered.
        </p>

        <div className="grid">
          {services.map((service, idx) => (
            <div
              className={`service ${visibleServiceIndexes.includes(idx) ? "visible" : ""}`}
              key={idx}
              data-index={idx}
              data-type="service"
            >
              <div className="circle">
                <Image src={service.img} alt={service.title} fill style={{ objectFit: "cover" }} />
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>

        {/* Highlights with colored background */}
        <div className="highlights-container">
          <div className="highlights">
            {highlights.map((item, idx) => (
              <div
                className={`highlight-item ${visibleHighlightIndexes.includes(idx) ? "visible" : ""}`}
                key={idx}
                data-index={idx}
                data-type="highlight"
              >
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Gallery;
