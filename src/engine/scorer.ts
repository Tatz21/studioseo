import { CategoryScores, SeoIssue } from './types';

export function calculateScores(issues: SeoIssue[]): CategoryScores {
  let techScore = 100;
  let contentScore = 100;
  let socialScore = 100;
  let perfScore = 95; // base performance score

  issues.forEach(issue => {
    const penalty = issue.severity === 'critical' ? 25 : issue.severity === 'warning' ? 10 : 0;
    
    if (issue.category === 'technical') {
      techScore = Math.max(0, techScore - penalty);
    } else if (issue.category === 'content') {
      contentScore = Math.max(0, contentScore - penalty);
    } else if (issue.category === 'social') {
      socialScore = Math.max(0, socialScore - penalty);
    } else if (issue.category === 'links') {
      contentScore = Math.max(0, contentScore - penalty * 0.7);
    }
  });

  // Weighted overall: Tech (40%), Content (35%), Social (15%), Performance (10%)
  const overall = Math.round(
    techScore * 0.40 +
    contentScore * 0.35 +
    socialScore * 0.15 +
    perfScore * 0.10
  );

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (overall >= 95) grade = 'A+';
  else if (overall >= 85) grade = 'A';
  else if (overall >= 70) grade = 'B';
  else if (overall >= 55) grade = 'C';
  else if (overall >= 40) grade = 'D';
  else grade = 'F';

  return {
    overall,
    grade,
    technical: Math.round(techScore),
    content: Math.round(contentScore),
    social: Math.round(socialScore),
    performance: Math.round(perfScore)
  };
}
