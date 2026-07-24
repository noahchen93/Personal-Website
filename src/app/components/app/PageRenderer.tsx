import React, { lazy, Suspense } from 'react';
import { Section } from './constants';

const HomePage = lazy(() => import('../pages/HomePage'));
const ProjectsPage = lazy(() => import('../pages/ProjectsPage'));
const AIExplorePage = lazy(() => import('../pages/AIExplorePage'));
const BlogPage = lazy(() => import('../pages/BlogPage'));
const InterestsPage = lazy(() => import('../pages/InterestsPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));

interface PageRendererProps {
  currentSection: Section;
}

export default function PageRenderer({ currentSection }: PageRendererProps) {
  const renderSection = () => {
    switch (currentSection) {
      case 'home':
        return <HomePage />;
      case 'projects':
        return <ProjectsPage />;
      case 'ai-explore':
        return <AIExplorePage />;
      case 'blog':
        return <BlogPage />;
      case 'interests':
        return <InterestsPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="h-full overflow-auto bg-black px-4 py-6 md:px-8 lg:px-12 xl:px-16 custom-scrollbar">
      <div className="terminal-content w-full">
        <div className="prose prose-invert prose-lg max-w-none">
          <Suspense
            fallback={(
              <div className="min-h-48 flex items-center justify-center text-green-300 font-terminal">
                Loading…
              </div>
            )}
          >
            {renderSection()}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
