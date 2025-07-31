export const PATTERNS = {
  DATE_TIME: /^\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}:\d{2}$/,
  YEAR_VALIDATION: {
    MIN: 1900,
    MAX: 2100,
  },
} as const;

export const SHEETS = {
  ALL_LEADS_TITLE: 'Все лиды' as const,
  DEFAULT_COLUMNS: 26,
  MONTH_SHEET_ROWS: 1000,
  ALL_LEADS_ROWS: 10000,
  MERGE_COLUMNS_COUNT: 7,
  COLUMN_HEADERS: [
    'Date',
    'ID',
    'Title',
    'Username',
    'Phone',
    'Comment',
    'Link',
    '',
  ] as const,
  ALL_LEADS_HEADERS: [
    'Date',
    'ID',
    'Title',
    'Username',
    'Phone',
    'Comment',
    'CRM Link',
    '',
  ] as const,
} as const;
