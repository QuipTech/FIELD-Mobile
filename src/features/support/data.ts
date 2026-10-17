export type FaqArticle = {
  id: string;
  question: string;
  paragraphs: string[];
  /** Highlighted call-out under the answer. */
  tip?: string;
};

/**
 * TODO(content): the M15 design's offline article plus placeholder answers for the other
 * questions. Have support review the copy, then serve it from the knowledge-base API.
 */
export const FAQS: FaqArticle[] = [
  {
    id: 'offline-in-the-pit',
    question: 'How do I work offline in the pit?',
    paragraphs: [
      'Every manual, procedure and machine record you open is cached automatically. Star a machine or document from its detail page to force it into offline storage before you lose signal.',
      "Anything you log offline (entries, photos, notes) queues in Sync and uploads the moment you're back in range. You can check pending items any time from Profile → Sync.",
    ],
    tip: 'Tip: enable "Download my site" in Profile → Offline downloads before your shift.',
  },
  {
    id: 'scan-to-open',
    question: 'How does scan-to-open work?',
    paragraphs: [
      "Tap Scan asset on Home and point your camera at the machine's asset tag. FIELD opens that machine's history, manuals and open cases straight away.",
      "If a tag is damaged or missing, search the machine's fleet number from Home instead, and let your site coordinator know so the tag can be replaced.",
    ],
  },
  {
    id: 'pending-sync',
    question: 'Why is my entry stuck "pending sync"?',
    paragraphs: [
      "Entries logged without signal wait in Sync until FIELD can reach the server, then upload on their own once you're back in range.",
      "If an entry stays pending after you're back online, open Profile → Sync to see what's waiting. Pending entries stay on this device until they upload.",
    ],
  },
  {
    id: 'raise-a-case',
    question: 'How do I raise a support case?',
    paragraphs: [
      "Open the Cases tab and tap New. Pick the machine, describe what's happening and add photos if you can — the more detail, the faster support can help.",
      "You can also raise a case from an Ask AI conversation when the assistant can't solve the problem; the conversation is attached for the support team.",
    ],
  },
];

export function useFaqs(): FaqArticle[] {
  return FAQS;
}

export function useFaq(id: string | undefined): FaqArticle | undefined {
  return FAQS.find((f) => f.id === id);
}

/** Case-insensitive match on the question and answer text. */
export function searchFaqs(faqs: FaqArticle[], query: string): FaqArticle[] {
  const q = query.trim().toLowerCase();
  if (!q) return faqs;
  return faqs.filter((f) =>
    [f.question, ...f.paragraphs, f.tip ?? ''].some((text) => text.toLowerCase().includes(q)),
  );
}
