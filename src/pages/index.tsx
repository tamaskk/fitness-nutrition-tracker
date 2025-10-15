import React from 'react';
import { useRouter } from 'next/router';
import { Header } from '@/component/Header';
import { Hero } from '@/component/Hero';
import { PrimaryFeatures } from '@/component/PrimaryFeatures';
import { Testimonials } from '@/component/Testimonials';
import { Pricing } from '@/component/Pricing';
import { Footer } from '@/component/Footer';

const MainPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />
      <Hero />
      <PrimaryFeatures />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
};

export default MainPage;