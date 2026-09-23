import React, { useState, useEffect } from 'react';
import { Header, NavigationTab } from './components/Header';
import { UrlInspectorBar } from './components/UrlInspectorBar';
import { HealthScoreGauge } from './components/HealthScoreGauge';
import { PageAuditView } from './components/pageaudit/PageAuditView';
import { HeadingHierarchyTree } from './components/HeadingHierarchyTree';
import { KeywordDensityTable } from './components/KeywordDensityTable';
import { LinksImagesInspector } from './components/LinksImagesInspector';
import { SchemaGenerator } from './components/SchemaGenerator';
import { RobotsSitemapTester } from './components/RobotsSitemapTester';
import { ExportModal } from './components/ExportModal';
import { HtmlPasteModal } from './components/HtmlPasteModal';
import { CommandPalette } from './components/common/CommandPalette';
import { AuthModal } from './components/auth/AuthModal';
import { SchemaExplorer } from './components/db/SchemaExplorer';
import { WebsiteManager } from './components/sites/WebsiteManager';
import { CrawlerLiveMonitor } from './components/crawler/CrawlerLiveMonitor';
import { DataExtractionInspector } from './components/extractor/DataExtractionInspector';
import { TechnicalAuditInspector } from './components/technical/TechnicalAuditInspector';
import { ScoreSnapshotExplorer } from './components/scoring/ScoreSnapshotExplorer';
import { SeoMapGraph } from './components/map/SeoMapGraph';
import { PageSpeedExplorer } from './components/pagespeed/PageSpeedExplorer';
import { GoogleSearchConsoleExplorer } from './components/gsc/GoogleSearchConsoleExplorer';
import { BingWebmasterExplorer } from './components/bing/BingWebmasterExplorer';
import { KeywordTrackerExplorer } from './components/keywords/KeywordTrackerExplorer';
import { SerpExplorer } from './components/serp/SerpExplorer';
import { CompetitorDiscoveryExplorer } from './components/competitors/CompetitorDiscoveryExplorer';
import { KeywordGapExplorer } from './components/keywordgap/KeywordGapExplorer';
import { BacklinksExplorer } from './components/backlinks/BacklinksExplorer';
import { PRESET_SITES } from './engine/presets';
import { runFullAudit, fetchUrlHtml, cleanAndSanitizeUrl } from './engine/index';
import { AuditReport } from './engine/types';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('audit');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Default to Timeliners Kolkata photography studio preset
  const defaultPreset = PRESET_SITES[0];
  const [currentHtml, setCurrentHtml] = useState<string>(defaultPreset.html);
  const [report, setReport] = useState<AuditReport>(() => {
    return runFullAudit(defaultPreset.html, defaultPreset.url);
  });

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPasteHtmlOpen, setIsPasteHtmlOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [selectedSerpKeyword, setSelectedSerpKeyword] = useState<string>('vintage movie posters');

  // Global Ctrl+K / Cmd+K Command Palette Keyboard Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute current active project details
  const activePreset = PRESET_SITES.find(p => 
    p.url.toLowerCase() === report.targetUrl.toLowerCase() || 
    p.url.replace(/^https?:\/\/(www\.)?/, '').toLowerCase() === report.targetUrl.replace(/^https?:\/\/(www\.)?/, '').toLowerCase()
  );
  const currentProjectName = activePreset?.name?.split('(')[0]?.trim() || 
    (report.targetUrl ? new URL(report.targetUrl).hostname.replace(/^www\./, '') : 'PostersCraft');

  // Handle URL scanning
  const handleScanUrl = async (url: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const cleanUrl = cleanAndSanitizeUrl(url);
      // Check if URL matches one of our presets
      const matchedPreset = PRESET_SITES.find(p => p.url.toLowerCase() === cleanUrl.toLowerCase() || p.url.replace(/^https?:\/\//, '') === cleanUrl.replace(/^https?:\/\//, ''));
      if (matchedPreset) {
        setCurrentHtml(matchedPreset.html);
        const newReport = runFullAudit(matchedPreset.html, matchedPreset.url);
        setReport(newReport);
        setIsLoading(false);
        return;
      }

      // Fetch HTML server-side via /api/fetch
      const fetchedHtml = await fetchUrlHtml(cleanUrl);
      setCurrentHtml(fetchedHtml);
      const newReport = runFullAudit(fetchedHtml, cleanUrl);
      setReport(newReport);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to analyze URL. You can paste the HTML directly using "Paste HTML".');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Preset Selection
  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_SITES.find(p => p.id === presetId);
    if (preset) {
      setErrorMessage(null);
      setIsLoading(true);
      setCurrentHtml(preset.html);
      setTimeout(() => {
        const newReport = runFullAudit(preset.html, preset.url);
        setReport(newReport);
        setIsLoading(false);
      }, 300);
    }
  };

  // Handle direct HTML paste
  const handleAuditHtml = (html: string, simulatedUrl: string) => {
    setErrorMessage(null);
    setIsLoading(true);
    setCurrentHtml(html);
    setTimeout(() => {
      const newReport = runFullAudit(html, simulatedUrl);
      setReport(newReport);
      setIsLoading(false);
    }, 200);
  };

  return (
    <div className="app-container">
      {/* Top Sticky Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenPasteHtml={() => setIsPasteHtmlOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        currentProjectName={currentProjectName}
        currentProjectUrl={report.targetUrl}
        onSelectProjectPreset={handleSelectPreset}
      />

      {/* Radar scanning bar */}
      {isLoading && <div className="radar-loader" />}

      {/* Main Content Area */}
      <main className="main-content">
        {/* URL Inspector & Preset Bar */}
        <UrlInspectorBar
          currentUrl={report.targetUrl}
          isLoading={isLoading}
          onScanUrl={handleScanUrl}
          onSelectPreset={handleSelectPreset}
        />

        {/* Error notification banner */}
        {errorMessage && (
          <div style={{
            background: 'var(--status-critical-bg)',
            border: '1px solid var(--status-critical)',
            color: 'var(--text-primary)',
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertCircle size={20} color="var(--status-critical)" />
              <span style={{ fontSize: '0.875rem' }}>{errorMessage}</span>
            </div>
            <button
              onClick={() => setIsPasteHtmlOpen(true)}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              Open HTML Paste Mode
            </button>
          </div>
        )}

        {/* Health Score & Key Metrics Banner */}
        <HealthScoreGauge
          scores={report.scores}
          issues={report.issues}
          wordCount={report.wordCount}
          readingEase={report.readingEaseScore}
          readingLevel={report.readingLevel}
          pageSizeKb={report.pageSizeKb}
          loadTimeMs={report.loadTimeMs}
        />

        {/* Active Tab Views */}
        {activeTab === 'websites' && (
          <WebsiteManager
            onSelectAndAuditWebsite={(url) => {
              setActiveTab('audit');
              handleScanUrl(url);
            }}
          />
        )}

        {activeTab === 'crawler' && (
          <CrawlerLiveMonitor
            initialUrl={report.targetUrl}
            onAuditPage={(url) => {
              setActiveTab('audit');
              handleScanUrl(url);
            }}
          />
        )}

        {activeTab === 'extraction' && (
          <DataExtractionInspector
            initialHtml={currentHtml}
            initialUrl={report.targetUrl}
          />
        )}

        {activeTab === 'technical' && (
          <TechnicalAuditInspector
            initialHtml={currentHtml}
            initialUrl={report.targetUrl}
          />
        )}

        {activeTab === 'scoring' && (
          <ScoreSnapshotExplorer
            initialHtml={currentHtml}
            initialUrl={report.targetUrl}
          />
        )}

        {activeTab === 'map' && (
          <SeoMapGraph
            onNavigateToExtractor={(url) => {
              setActiveTab('extraction');
              handleScanUrl(url);
            }}
            onNavigateToTechnical={(url) => {
              setActiveTab('technical');
              handleScanUrl(url);
            }}
          />
        )}

        {activeTab === 'audit' && (
          <PageAuditView
            initialHtml={currentHtml}
            initialUrl={report.targetUrl}
          />
        )}

        {activeTab === 'pagespeed' && (
          <PageSpeedExplorer />
        )}

        {activeTab === 'gsc' && (
          <GoogleSearchConsoleExplorer />
        )}

        {activeTab === 'bing' && (
          <BingWebmasterExplorer />
        )}

        {activeTab === 'ranktracker' && (
          <KeywordTrackerExplorer
            onInspectSerp={(kw) => {
              setSelectedSerpKeyword(kw);
              setActiveTab('serp');
            }}
          />
        )}

        {activeTab === 'serp' && (
          <SerpExplorer
            initialKeyword={selectedSerpKeyword}
            initialUrl={report.targetUrl}
            pageMetadata={report.metadata}
            onNavigateToKeywords={() => setActiveTab('ranktracker')}
            onNavigateToCompetitors={() => setActiveTab('competitors')}
          />
        )}

        {activeTab === 'competitors' && (
          <CompetitorDiscoveryExplorer
            onInspectSerp={(kw) => {
              setSelectedSerpKeyword(kw);
              setActiveTab('serp');
            }}
            onNavigateToKeywords={() => setActiveTab('ranktracker')}
          />
        )}

        {activeTab === 'keywordgap' && (
          <KeywordGapExplorer
            currentUrl={report.targetUrl}
            onNavigateToTracker={() => setActiveTab('ranktracker')}
          />
        )}

        {activeTab === 'backlinks' && (
          <BacklinksExplorer
            currentUrl={report.targetUrl}
            onNavigateToAudit={(targetUrl) => {
              setActiveTab('audit');
              handleScanUrl(targetUrl);
            }}
            onNavigateToCompetitors={() => setActiveTab('competitors')}
          />
        )}

        {activeTab === 'keywords' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <HeadingHierarchyTree headings={report.headings} />
            <KeywordDensityTable
              unigrams={report.keywords.unigrams}
              bigrams={report.keywords.bigrams}
              trigrams={report.keywords.trigrams}
            />
          </div>
        )}

        {activeTab === 'links' && (
          <LinksImagesInspector
            links={report.links}
            images={report.images}
          />
        )}

        {activeTab === 'schema' && (
          <SchemaGenerator />
        )}

        {activeTab === 'robots' && (
          <RobotsSitemapTester />
        )}

        {activeTab === 'database' && (
          <SchemaExplorer />
        )}
      </main>

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        report={report}
      />

      <HtmlPasteModal
        isOpen={isPasteHtmlOpen}
        onClose={() => setIsPasteHtmlOpen(false)}
        onAuditHtml={handleAuditHtml}
      />

      {/* Global Command Palette Spotlight */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsCommandPaletteOpen(false);
        }}
        onOpenExport={() => {
          setIsCommandPaletteOpen(false);
          setIsExportOpen(true);
        }}
        onOpenPasteHtml={() => {
          setIsCommandPaletteOpen(false);
          setIsPasteHtmlOpen(true);
        }}
      />

      {/* Authentication Modal */}
      <AuthModal />
    </div>
  );
};
