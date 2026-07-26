import React, { Suspense } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Section } from './constants';
import HomePage from '../pages/HomePage';
import PageLoadingState from '../shared/PageLoadingState';

const ProjectsPage = React.lazy(() => import('../pages/ProjectsPage'));
const AIExplorePage = React.lazy(() => import('../pages/AIExplorePage'));
const BlogPage = React.lazy(() => import('../pages/BlogPage'));
const InterestsPage = React.lazy(() => import('../pages/InterestsPage'));
const ContactPage = React.lazy(() => import('../pages/ContactPage'));

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
        initial={reduceMotion ? false : { y: 6 }}
        animate={{ y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="terminal-content portfolio-page__content">
          <Suspense fallback={<PageLoadingState />}>
            {renderSection()}
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
