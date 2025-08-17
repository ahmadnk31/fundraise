import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { HomepageCategoryFilter } from "@/components/HomepageCategoryFilter";
import { FeaturedCampaigns } from "@/components/FeaturedCampaigns";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { SuccessStories } from "@/components/SuccessStories";
import { Pricing } from "@/components/Pricing";
import { TrustAndSafety } from "@/components/TrustAndSafety";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <HowItWorks />
      <HomepageCategoryFilter />
      <FeaturedCampaigns />
      <WhyChooseUs />
      <SuccessStories />
      <Pricing />
      <TrustAndSafety />
      <Footer />
    </div>
  );
};

export default Index;
