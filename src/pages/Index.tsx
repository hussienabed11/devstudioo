import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import ServicesSection from '@/components/sections/ServicesSection';
import RightChoiceSection from '@/components/sections/RightChoiceSection';
import PackagesSection from '@/components/sections/PackagesSection';
import HowWeWorkSection from '@/components/sections/HowWeWorkSection';
import PortfolioSection from '@/components/sections/PortfolioSection';
import BookingSection from '@/components/sections/BookingSection';
import Footer from '@/components/Footer';
import BackToTop from "@/components/BackToTop";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    const scrollTo = (location.state as any)?.scrollTo;
    if (scrollTo) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById(scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
      // Clear state so it doesn't re-scroll on re-renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <RightChoiceSection />
        <HowWeWorkSection />
        <PortfolioSection />
        <PackagesSection />
        <BookingSection />
        <BackToTop />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
