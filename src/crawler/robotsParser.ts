/**
 * Phase 5: Robots.txt Parser & Compliance Engine
 * Conforms to the standard Robots Exclusion Protocol (REP / RFC 9309).
 */

import { RobotsDirective, RobotsCheckResult } from './types';

export class RobotsParser {
  private directives: RobotsDirective[] = [];
  private sitemaps: string[] = [];
  private rawContent: string = '';

  constructor(robotsTxtContent?: string) {
    if (robotsTxtContent) {
      this.parse(robotsTxtContent);
    }
  }

  /**
   * Parse robots.txt syntax into structured rules
   */
  public parse(content: string): void {
    this.rawContent = content;
    this.directives = [];
    this.sitemaps = [];

    const lines = content.split(/\r?\n/);
    let currentAgents: string[] = [];
    let currentDisallowed: string[] = [];
    let currentAllowed: string[] = [];
    let currentDelay: number | undefined;

    const commitCurrentGroup = () => {
      if (currentAgents.length > 0) {
        for (const agent of currentAgents) {
          this.directives.push({
            userAgent: agent.toLowerCase(),
            disallowedPaths: [...currentDisallowed],
            allowedPaths: [...currentAllowed],
            crawlDelaySeconds: currentDelay,
            sitemaps: []
          });
        }
      }
      currentAgents = [];
      currentDisallowed = [];
      currentAllowed = [];
      currentDelay = undefined;
    };

    for (const rawLine of lines) {
      // Remove comments and trim whitespace
      const line = rawLine.split('#')[0].trim();
      if (!line) continue;

      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;

      const field = line.slice(0, colonIdx).trim().toLowerCase();
      const value = line.slice(colonIdx + 1).trim();

      if (field === 'user-agent') {
        // If previous directives were populated and we hit a new user-agent, commit the block
        if (currentDisallowed.length > 0 || currentAllowed.length > 0 || currentDelay !== undefined) {
          commitCurrentGroup();
        }
        currentAgents.push(value);
      } else if (field === 'disallow') {
        if (value) {
          currentDisallowed.push(value);
        }
      } else if (field === 'allow') {
        if (value) {
          currentAllowed.push(value);
        }
      } else if (field === 'crawl-delay') {
        const delay = parseFloat(value);
        if (!isNaN(delay)) {
          currentDelay = delay;
        }
      } else if (field === 'sitemap') {
        if (value.startsWith('http://') || value.startsWith('https://')) {
          if (!this.sitemaps.includes(value)) {
            this.sitemaps.push(value);
          }
        }
      }
    }

    // Commit any trailing rule group
    commitCurrentGroup();
  }

  /**
   * Determines if a URL path is allowed for the target user agent
   */
  public isAllowed(targetUrl: string, userAgent = 'SEOStudio-Spider'): RobotsCheckResult {
    let pathname = '/';
    try {
      const parsed = new URL(targetUrl);
      pathname = parsed.pathname + parsed.search;
    } catch {
      pathname = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`;
    }

    const agentKey = userAgent.toLowerCase();

    // 1. Look for specific user-agent group first
    let matchedGroup = this.directives.find(d => agentKey.includes(d.userAgent));

    // 2. Fall back to wildcard '*' group if no specific agent group matches
    if (!matchedGroup) {
      matchedGroup = this.directives.find(d => d.userAgent === '*');
    }

    // If no rules apply, everything is allowed by default
    if (!matchedGroup) {
      return {
        isAllowed: true,
        sitemapsFound: this.sitemaps
      };
    }

    // RFC 9309: Longest matching rule wins between Allow and Disallow
    let longestAllowMatch = -1;
    let longestDisallowMatch = -1;
    let matchedRule: string | undefined;

    for (const allowPattern of matchedGroup.allowedPaths) {
      if (this.pathMatches(pathname, allowPattern)) {
        if (allowPattern.length > longestAllowMatch) {
          longestAllowMatch = allowPattern.length;
        }
      }
    }

    for (const disallowPattern of matchedGroup.disallowedPaths) {
      if (this.pathMatches(pathname, disallowPattern)) {
        if (disallowPattern.length > longestDisallowMatch) {
          longestDisallowMatch = disallowPattern.length;
          matchedRule = `Disallow: ${disallowPattern}`;
        }
      }
    }

    // If allow rule is longer or equal to disallow rule, it is allowed
    const isAllowed = longestAllowMatch >= longestDisallowMatch;

    return {
      isAllowed,
      matchedRule: isAllowed ? undefined : matchedRule,
      crawlDelaySeconds: matchedGroup.crawlDelaySeconds,
      sitemapsFound: this.sitemaps
    };
  }

  /**
   * Evaluates standard robots.txt pattern matching with * (any chars) and $ (end of URL)
   */
  private pathMatches(path: string, pattern: string): boolean {
    if (!pattern) return true;
    if (pattern === '/') return true;

    // Convert robots.txt pattern to regex
    // Escape special regex characters except * and $
    let escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    escaped = escaped.replace(/\\\*/g, '.*'); // Restore * as regex wildcard

    if (escaped.endsWith('\\$')) {
      escaped = escaped.slice(0, -2) + '$';
    }

    try {
      const regex = new RegExp(`^${escaped}`);
      return regex.test(path);
    } catch {
      return path.startsWith(pattern);
    }
  }

  public getSitemaps(): string[] {
    return [...this.sitemaps];
  }

  public getRawContent(): string {
    return this.rawContent;
  }
}
