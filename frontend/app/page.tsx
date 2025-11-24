"use client";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Gallery from "../components/Gallery";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import "../styles/hero.css";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Gallery />
      <Contact />
      <Footer />
    </>
  );
}
