import { Lead, LeadSchema } from '../schemas/lead';
import { formatDateForTable, formatDayForSheet } from './dates';
import { PATTERNS, SHEETS } from './constants';

export { LeadSchema };

export type SheetRow = (string | number)[];
export type SheetData = SheetRow[];

export function formatLeadForTable(lead: Lead): SheetRow {
  const dateValue = formatDateForTable(lead.dateUpdated);

  return [
    dateValue,
    lead.recipientId,
    lead.recipientTitle,
    lead.recipientUsername || ' ',
    lead.recipientPhone || ' ',
    lead.aiReason,
    `https://app.aisender.ru/leads/${lead.groupId}/${lead.recipientId}`,
    ' ',
  ];
}

export function findDayInMonthData(data: SheetData, targetDate: Date) {
  const targetDayFormatted = formatDayForSheet(targetDate);
  return data.findIndex((row) => row?.[0] === targetDayFormatted);
}

export function isDay(text: unknown): text is string {
  if (typeof text !== 'string') return false;
  const months = [
    'ЯНВАРЯ',
    'ФЕВРАЛЯ',
    'МАРТА',
    'АПРЕЛЯ',
    'МАЯ',
    'ИЮНЯ',
    'ИЮЛЯ',
    'АВГУСТА',
    'СЕНТЯБРЯ',
    'ОКТЯБРЯ',
    'НОЯБРЯ',
    'ДЕКАБРЯ',
  ];
  return months.some((month) => text.includes(month));
}

function parseDateFromTable(dateString: string) {
  const dateTimePattern =
    /^(\d{2})\.(\d{2})\.(\d{4}), (\d{2}):(\d{2}):(\d{2})$/;
  const match = dateString.match(dateTimePattern);

  if (!match) return null;

  const [, day, month, year, hours, minutes, seconds] = match;
  const isoString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  const date = new Date(isoString);

  if (isNaN(date.getTime())) return null;
  return date;
}

export function isLead(text: string) {
  return parseDateFromTable(text) !== null;
}

export function isMonthSheet(title: string) {
  const parts = title.split(' ');
  if (parts.length !== 2) return false;

  const [monthName, yearStr] = parts;
  const monthNames = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];

  if (!monthNames.includes(monthName)) return false;

  const year = parseInt(yearStr);
  return (
    !isNaN(year) &&
    yearStr.length === 4 &&
    year >= PATTERNS.YEAR_VALIDATION.MIN &&
    year <= PATTERNS.YEAR_VALIDATION.MAX
  );
}

export function parseSheetDate(sheetTitle: string) {
  const parts = sheetTitle.split(' ');
  if (parts.length !== 2) return 0;

  const [monthName, yearStr] = parts;
  const year = parseInt(yearStr);
  const monthNames = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];
  const monthIndex = monthNames.indexOf(monthName);

  if (isNaN(year) || monthIndex === -1) return 0;

  return new Date(year, monthIndex, 1).getTime();
}

export function findInsertPositionInMonth(
  data: SheetData,
  targetDate: Date,
  type: 'day' | 'lead',
  startIndex = 0
) {
  if (type === 'day') {
    return findDayInsertPosition(data, targetDate, startIndex);
  }
  return findLeadInsertPosition(data, targetDate, startIndex);
}

function findDayInsertPosition(
  data: SheetData,
  targetDate: Date,
  startIndex: number
) {
  for (let i = startIndex; i < data.length; i++) {
    const cellText = data[i]?.[0];
    if (!cellText || !isDay(cellText)) continue;

    const currentDayFormatted = formatDayForSheet(targetDate);

    if (cellText === currentDayFormatted) {
      return i;
    }

    const months = [
      'ЯНВАРЯ',
      'ФЕВРАЛЯ',
      'МАРТА',
      'АПРЕЛЯ',
      'МАЯ',
      'ИЮНЯ',
      'ИЮЛЯ',
      'АВГУСТА',
      'СЕНТЯБРЯ',
      'ОКТЯБРЯ',
      'НОЯБРЯ',
      'ДЕКАБРЯ',
    ];

    const parts = cellText.toString().split(' ');
    if (parts.length >= 4) {
      const day = parseInt(parts[1]);
      const monthName = parts[2];
      const year = parseInt(parts[3]);
      const monthIndex = months.indexOf(monthName);

      if (!isNaN(day) && !isNaN(year) && monthIndex !== -1) {
        const currentDate = new Date(year, monthIndex, day);
        if (targetDate > currentDate) {
          return i;
        }
      }
    }
  }

  return data.length;
}

function findLeadInsertPosition(
  data: SheetData,
  targetDate: Date,
  startIndex: number
) {
  for (let i = startIndex; i < data.length; i++) {
    const cellText = data[i]?.[0];
    if (!cellText) continue;

    const cellString = cellText.toString();
    if (isDay(cellString)) return i;

    if (isLead(cellString)) {
      const currentDate = new Date(cellString);
      if (currentDate && targetDate < currentDate) {
        return i;
      }
    }
  }

  return data.length;
}

export function findInsertPositionForAllLeads(
  data: SheetData,
  targetDate: Date
) {
  for (let i = 0; i < data.length; i++) {
    const cellText = data[i]?.[0];
    if (!cellText) continue;

    const cellString = cellText.toString();
    if (!isLead(cellString)) continue;

    const currentDate = parseDateFromTable(cellString);
    if (currentDate && targetDate > currentDate) {
      return i;
    }
  }

  return data.length;
}
