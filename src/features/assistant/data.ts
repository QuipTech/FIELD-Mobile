import type { AiUsageReport } from './usage';

export type Citation = {
  id: string;
  /** e.g. "1 · Manual p.214". */
  label: string;
  /** In-app article this cites, when there is one. */
  articleId?: string;
  /** Knowledge document, page and section (e.g. "4.3") the citation deep-links to. */
  documentId?: string;
  page?: number;
  sectionId?: string;
};

export type Feedback = 'helpful' | 'wrong';

/** How an answer was produced. Admins see it under the answer; only set when the API sends it. */
export type AnswerReview = { confidence: number; sections: number };

export type ChatMessage =
  | { id: string; role: 'user'; text: string; /** Local photo sent with it. */ imageUri?: string }
  | {
      id: string;
      role: 'assistant';
      text: string;
      citations: Citation[];
      review?: AnswerReview;
      /** The API's `assistantMessageId`, needed for feedback. Unset while streaming. */
      messageId?: string;
      streaming?: boolean;
      feedback?: Feedback;
    }
  | { id: string; role: 'notice'; text: string };

export type AiUsage = {
  used: number;
  limit: number;
  /** Org-wide for admins, the signed-in user's own for everyone else. */
  scope: 'mine' | 'org';
  /** ISO date the allowance resets. */
  resetsOn: string;
  /** Cost per query over the allowance, e.g. "$0.04". Admins only. */
  overage?: string;
};

/** Org-wide usage for admins, the user's own for everyone else. */
export function toAiUsage(report: AiUsageReport, isAdmin: boolean): AiUsage {
  const scope = isAdmin ? 'org' : 'mine';
  const a = isAdmin ? report.organisation : report.personal;
  return { used: a.used, limit: a.limit, scope, resetsOn: report.resetsOn ?? '' };
}

export const SUGGESTIONS = [
  'Why won’t E-2204 clear?',
  'Torque spec for the final drive bolts',
  'Drill rod change procedure',
];
