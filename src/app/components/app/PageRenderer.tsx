import React from 'react';
import HomePage from '../pages/HomePage';
import ProjectsPage from '../pages/ProjectsPage';
import AIExplorePage from '../pages/AIExplorePage';
import BlogPage from '../pages/BlogPage';
import InterestsPage from '../pages/InterestsPage';
import ContactPage from '../pages/ContactPage';
import { Section } from './constants';

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
    <main className="flex-1 overflow-auto bg-black px-8 py-6 lg:px-12 xl:px-16 custom-scrollbar">
      <div className="terminal-content w-full">
        <div className="prose prose-invert prose-lg max-w-none">
          {renderSection()}
        </div>
      </div>
    </main>
  );
}