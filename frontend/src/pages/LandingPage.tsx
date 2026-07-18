import { Navbar } from '../components/sections/Navbar';
import { Hero } from '../components/sections/Hero';
import { SearchSection } from '../components/sections/SearchSection';
import { FeaturedPrograms } from '../components/sections/FeaturedPrograms';
import { WhyKaamLok } from '../components/sections/WhyKaamLok';
//import { HowItWorks } from '../components/sections/HowItWorks';
import { NGOPartners } from '../components/sections/NGOPartners';
import { SuccessStories } from '../components/sections/SuccessStories';
import { Impact } from '../components/sections/Impact';
import { Testimonials } from '../components/sections/Testimonials';
import { FAQ } from '../components/sections/FAQ';
import { FinalCTA, Footer } from '../components/sections/Footer';

/**
 * The KaamLok marketing landing page.
 * This is the public home route — all auth routes are separate.
 */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <main>
        <Hero />
        <SearchSection />
        <FeaturedPrograms />
        <WhyKaamLok />
        
        <NGOPartners />
        <SuccessStories />
        <Impact />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
