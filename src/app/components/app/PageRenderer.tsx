import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Section } from './constants';
import HomePage from '../pages/HomePage';
import ProjectsPage from '../pages/ProjectsPage';
import AIExplorePage from '../pages/AIExplorePage';
import BlogPage from '../pages/BlogPage';
import InterestsPage from '../pages/InterestsPage';
import ContactPage from '../pages/ContactPage';

interface PageRendererProps {
  currentSection: Section;
}

export default function PageRenderer({ currentSection }: PageRendererProps) {
  const reduceMotion = useReducedMotion();

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
    <div className="portfolio-page-scroll custom-scrollbar">
      <motion.div
        key={currentSection}
        className="portfolio-page"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="terminal-content portfolio-page__content">
          {renderSection()}
        </div>
      </motion.div>
    </div>
  );
}
