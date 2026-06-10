import Navbar from "@/components/Navbar";
import AboutSection from "@/components/AboutSection";
import ExperienceSection from "@/components/ExperienceSection";
import ProjectsSection from "@/components/ProjectsSection";
import GameReviewsSection from "@/components/GameReviewsSection";
import GastronomySection from "@/components/GastronomySection";
import GameBacklogSection from "@/components/GameBacklogSection";
import RecipesSection from "@/components/RecipesSection";
import EducationSection from "@/components/EducationSection";
import BooksSection from "@/components/BooksSection";
import MediaBacklogSection from "@/components/MediaBacklogSection";
import StudySection from "@/components/StudySection";
import NotesSection from "@/components/NotesSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
      <div className="min-h-dvh p-3 md:p-6">
        <Navbar />

        <main className="max-w-7xl mx-auto space-y-4 md:space-y-6">
          {/* Top: Professional */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            <section className="lg:col-span-8 space-y-4 md:space-y-6">
              <ExperienceSection />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <ProjectsSection />
                <EducationSection />
              </div>
            </section>
            <AboutSection />
          </div>

          {/* Bottom: Personal */}
          <BooksSection />
          <GameReviewsSection />
          <GameBacklogSection />
          <RecipesSection />
          <GastronomySection />
          <MediaBacklogSection />
          <StudySection />
          <NotesSection />
        </main>

        <Footer />
      </div>
  );
};

export default Index;
