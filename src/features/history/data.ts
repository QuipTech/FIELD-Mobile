export type AiConversation = {
  id: string;
  /** Fleet number of the machine it was about, if any. */
  machine?: string;
  /** The opening question. */
  question: string;
  /** ISO time of the last message. */
  at: string;
};

/** Why an answer landed in the admin review queue. */
export type ReviewReason = 'safety' | 'noSource' | 'markedWrong' | 'lowConfidence';
export type ReviewStatus = 'unreviewed' | 'inReview' | 'escalated' | 'resolved';

export type ReviewItem = {
  id: string;
  /** The question that was flagged. */
  title: string;
  reason: ReviewReason;
  /** Who asked. */
  author: string;
  /** Empty when the question wasn't about a machine. */
  machineId: string;
  status: ReviewStatus;
  /** Reviewer initials while in review. */
  reviewer?: string;
};
