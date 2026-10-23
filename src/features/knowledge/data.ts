export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'figure'; caption: string }
  | { type: 'warning'; text: string };

export type KnowledgeArticle = {
  id: string;
  kind: 'Procedure' | 'Bulletin';
  title: string;
  model: string;
  /** e.g. "Rev 4" or "Issued 28 Feb". */
  revision: string;
  offline: boolean;
  blocks: ArticleBlock[];
};
