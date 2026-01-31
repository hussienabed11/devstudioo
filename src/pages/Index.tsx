import React from 'react';
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

const Index = () => {
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
      </main>
      <Footer />
    </div>
  );
};

export default Index;