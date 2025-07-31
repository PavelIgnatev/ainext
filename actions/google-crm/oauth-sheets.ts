'use server';
import GoogleAPI from './api/google-api';
import GoogleAuth from './api/google-auth';
import { getMonthName, formatDayForSheet } from './utils/dates';
import {
  formatLeadForTable,
  findDayInMonthData,
  findInsertPositionInMonth,
  LeadSchema,
  isMonthSheet,
  parseSheetDate,
  findInsertPositionForAllLeads,
} from './utils/data';
import { Lead } from './schemas/lead';
import {
  BatchUpdateRequest,
  SheetData as SheetDataType,
} from './@types/google-crm';
import { SHEETS } from './utils/constants';

async function addHeadersToAllLeads(
  api: GoogleAPI,
  spreadsheetId: string,
  sheetTitle: string
) {
  await api.updateValues(spreadsheetId, `'${sheetTitle}'!A1:H1`, [
    [...SHEETS.ALL_LEADS_HEADERS],
  ]);
}

async function setColumnWidths(
  api: GoogleAPI,
  spreadsheetId: string,
  sheetId: number
) {
  const requests: BatchUpdateRequest = [
    {
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: 'COLUMNS',
          startIndex: 0,
          endIndex: 1,
        },
        properties: {
          pixelSize: 130,
        },
        fields: 'pixelSize',
      },
    },
    {
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: 'COLUMNS',
          startIndex: 2,
          endIndex: 3,
        },
        properties: {
          pixelSize: 140,
        },
        fields: 'pixelSize',
      },
    },
    {
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: 'COLUMNS',
          startIndex: 4,
          endIndex: 5,
        },
        properties: {
          pixelSize: 120,
        },
        fields: 'pixelSize',
      },
    },
    {
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: 'COLUMNS',
          startIndex: 5,
          endIndex: 6,
        },
        properties: {
          pixelSize: 300,
        },
        fields: 'pixelSize',
      },
    },
    {
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: 'COLUMNS',
          startIndex: 6,
          endIndex: 7,
        },
        properties: {
          pixelSize: 250,
        },
        fields: 'pixelSize',
      },
    },
  ];

  await api.batchUpdate(spreadsheetId, requests);
}

async function reorderSheets(api: GoogleAPI, spreadsheetId: string) {
  const response = await api.getSpreadsheet(spreadsheetId);

  const allLeadsSheet: SheetDataType[] = [];
  const monthSheets: SheetDataType[] = [];
  const otherSheets: SheetDataType[] = [];

  for (const sheet of response.data.sheets || []) {
    if (!sheet.properties?.title || sheet.properties?.sheetId === undefined) {
      throw new Error('SHEET_PROPERTIES_NOT_DEFINED');
    }

    const title = sheet.properties.title;
    if (title === SHEETS.ALL_LEADS_TITLE) {
      allLeadsSheet.push(sheet as SheetDataType);
    } else if (isMonthSheet(title)) {
      monthSheets.push(sheet as SheetDataType);
    } else {
      otherSheets.push(sheet as SheetDataType);
    }
  }

  if (otherSheets.length > 0) {
    const sheetsForDelete = otherSheets
      .filter((sheet) => sheet.properties.sheetId !== undefined)
      .map((sheet) => ({
        deleteSheet: {
          sheetId: sheet.properties.sheetId,
        },
      }));

    await api.batchUpdate(spreadsheetId, sheetsForDelete);
  }

  if (monthSheets.length <= 1) {
    return;
  }

  const sortedSheets = [...monthSheets].sort((a, b) => {
    const dateA = parseSheetDate(a.properties.title);
    const dateB = parseSheetDate(b.properties.title);
    return dateB - dateA;
  });

  const needsSorting = monthSheets.some(
    (sheet, index) =>
      sheet.properties.sheetId !== sortedSheets[index].properties.sheetId
  );

  if (!needsSorting) {
    return;
  }

  const requests: BatchUpdateRequest = [];

  if (allLeadsSheet.length > 0) {
    const allLeadsSheetId = allLeadsSheet[0].properties.sheetId;
    if (allLeadsSheetId !== undefined) {
      requests.push({
        updateSheetProperties: {
          properties: {
            sheetId: allLeadsSheetId,
            index: 0,
          },
          fields: 'index',
        },
      });
    }
  }

  for (let i = 0; i < sortedSheets.length; i++) {
    const sheetId = sortedSheets[i].properties.sheetId;
    if (sheetId !== undefined) {
      requests.push({
        updateSheetProperties: {
          properties: {
            sheetId,
            index: i + 1,
          },
          fields: 'index',
        },
      });
    }
  }

  await api.batchUpdate(spreadsheetId, requests);
}

async function getSheet(
  api: GoogleAPI,
  spreadsheetId: string,
  sheetTitle: string
) {
  const response = await api.getSpreadsheet(spreadsheetId);

  for (const sheet of response.data.sheets || []) {
    if (sheet.properties?.title === sheetTitle && sheet.properties.sheetId) {
      return sheet.properties.sheetId;
    }
  }

  const br = await api.batchUpdate(spreadsheetId, [
    {
      addSheet: {
        properties: {
          title: sheetTitle,
          gridProperties: {
            rowCount: SHEETS.MONTH_SHEET_ROWS,
            columnCount: SHEETS.DEFAULT_COLUMNS,
          },
        },
      },
    },
  ]);

  const { sheetId } = br.data.replies?.[0]?.addSheet?.properties || {};
  if (!sheetId) {
    throw new Error('NEW_SHEET_ID_NOT_DEFINED');
  }

  await setColumnWidths(api, spreadsheetId, sheetId);
  await reorderSheets(api, spreadsheetId);

  return sheetId;
}

async function insertRow(
  api: GoogleAPI,
  spreadsheetId: string,
  position: number,
  rows: (string | number)[],
  sheetId: number,
  sheetTitle: string,
  mergeRow = false
) {
  const requests: BatchUpdateRequest = [
    {
      insertDimension: {
        range: {
          sheetId,
          dimension: 'ROWS',
          startIndex: position,
          endIndex: position + 1,
        },
        inheritFromBefore: false,
      },
    },
  ];

  if (mergeRow) {
    requests.push({
      mergeCells: {
        range: {
          sheetId,
          startRowIndex: position,
          endRowIndex: position + 1,
          startColumnIndex: 0,
          endColumnIndex: SHEETS.MERGE_COLUMNS_COUNT,
        },
        mergeType: 'MERGE_ALL',
      },
    });
  }

  await api.batchUpdate(spreadsheetId, requests);

  await api.updateValues(
    spreadsheetId,
    `'${sheetTitle}'!A${position + 1}:I${position + 1}`,
    [rows]
  );
}

async function addLeadToAll(spreadsheetId: string, leadData: Lead) {
  LeadSchema.parse(leadData);

  const auth = await GoogleAuth.initializeAuth();
  const api = new GoogleAPI(auth);

  const sheetTitle = SHEETS.ALL_LEADS_TITLE;
  const sheetId = await getSheet(api, spreadsheetId, sheetTitle);

  let data = await api.getValues(spreadsheetId, `'${sheetTitle}'!A:Z`);
  if (data.length === 0) {
    data = [];
    await addHeadersToAllLeads(api, spreadsheetId, sheetTitle);
    data = [[...SHEETS.ALL_LEADS_HEADERS]];
  }

  const insertPos = findInsertPositionForAllLeads(data, leadData.dateUpdated);
  const formattedLead = formatLeadForTable(leadData);

  await insertRow(
    api,
    spreadsheetId,
    insertPos,
    formattedLead,
    sheetId,
    sheetTitle
  );
}

async function createGoogleTable(title: string) {
  try {
    const auth = await GoogleAuth.initializeAuth();
    const api = new GoogleAPI(auth);
    const spreadsheetId = await api.createSpreadsheet(title);
    await api.createPermission(spreadsheetId);

    const now = new Date();
    await api.batchUpdate(spreadsheetId, [
      {
        addSheet: {
          properties: {
            title: SHEETS.ALL_LEADS_TITLE,
            gridProperties: {
              rowCount: SHEETS.ALL_LEADS_ROWS,
              columnCount: SHEETS.DEFAULT_COLUMNS,
            },
            index: 0,
          },
        },
      },
      {
        addSheet: {
          properties: {
            title: `${getMonthName(now.getMonth())} ${now.getFullYear()}`,
            gridProperties: {
              rowCount: SHEETS.MONTH_SHEET_ROWS,
              columnCount: SHEETS.DEFAULT_COLUMNS,
            },
            index: 1,
          },
        },
      },
    ]);

    await api.batchUpdate(spreadsheetId, [{ deleteSheet: { sheetId: 0 } }]);

    const response = await api.getSpreadsheet(spreadsheetId);

    for (const sheet of response.data.sheets || []) {
      if (sheet.properties?.sheetId) {
        await setColumnWidths(api, spreadsheetId, sheet.properties.sheetId);

        if (sheet.properties.title === SHEETS.ALL_LEADS_TITLE) {
          await addHeadersToAllLeads(
            api,
            spreadsheetId,
            sheet.properties.title
          );
        }
      }
    }

    return spreadsheetId;
  } catch (error) {
    throw new Error(`CREATE_GOOGLE_TABLE_ERROR: ${(error as Error).message}`);
  }
}

async function addLead(spreadsheetId: string, leadData: Lead) {
  try {
    LeadSchema.parse(leadData);

    const auth = await GoogleAuth.initializeAuth();
    const api = new GoogleAPI(auth);
    const dateToUse = new Date(leadData.dateUpdated);
    const year = dateToUse.getFullYear();
    const month = dateToUse.getMonth();

    const sheetTitle = `${getMonthName(month)} ${year}`;
    const sheetId = await getSheet(api, spreadsheetId, sheetTitle);

    const dayFormatted = formatDayForSheet(dateToUse);

    let data = await api.getValues(spreadsheetId, `'${sheetTitle}'!A:Z`);
    if (data.length === 0) {
      data = [];
    }

    let dayPos = findDayInMonthData(data, dateToUse);

    if (dayPos === -1) {
      const insertPos = findInsertPositionInMonth(data, dateToUse, 'day');

      const dayRow = Array(SHEETS.MERGE_COLUMNS_COUNT).fill('');
      dayRow[0] = dayFormatted;

      await insertRow(
        api,
        spreadsheetId,
        insertPos,
        dayRow,
        sheetId,
        sheetTitle,
        true
      );

      data = await api.getValues(spreadsheetId, `'${sheetTitle}'!A:Z`);
      dayPos = findDayInMonthData(data, dateToUse);
    }

    const leadInsertPos = findInsertPositionInMonth(
      data,
      dateToUse,
      'lead',
      dayPos + 1
    );
    const formattedLead = formatLeadForTable(leadData);
    await insertRow(
      api,
      spreadsheetId,
      leadInsertPos,
      formattedLead,
      sheetId,
      sheetTitle
    );

    await addLeadToAll(spreadsheetId, leadData);

    return true;
  } catch (error) {
    throw new Error(`ADD_LEAD_ERROR: ${(error as Error).message}`);
  }
}

export { createGoogleTable, addLead };
