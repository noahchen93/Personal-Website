import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface TerminalHeaderProps {
  isZh: boolean;
  isOnline: boolean;
}

export default function TerminalHeader({ isZh, isOnline }: TerminalHeaderProps) {
  return (
    <header className="portfolio-masthead">
      <div className="portfolio-masthead__identity">
        <div className="portfolio-masthead__mark" aria-hidden="true">
          NC
        </div>
        <div>
          <p className="portfolio-masthead__name">Noah Chen</p>
          <p className="portfolio-masthead__role">
            {isZh ? '产品设计 · AI 实践' : 'Product design · AI practice'}
          </p>
        </div>
      </div>

      <div className="portfolio-masthead__meta">
        <span className={`portfolio-status ${isOnline ? 'is-online' : 'is-offline'}`}>
          <span className="portfolio-status__dot" />
          {isOnline
            ? (isZh ? '内容已同步' : 'Content synced')
            : (isZh ? '本地内容' : 'Local content')}
        </span>
        <span className="portfolio-masthead__edition">
          2026 <ArrowUpRight aria-hidden="true" />
        </span>
      </div>
    </header>
  );
}
