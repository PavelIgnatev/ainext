export type BatchUpdateRequest = Array<{
  insertDimension?: {
    range: {
      sheetId: number;
      dimension: string;
      startIndex: number;
      endIndex: number;
    };
    inheritFromBefore: boolean;
  };
  mergeCells?: {
    range: {
      sheetId: number;
      startRowIndex: number;
      endRowIndex: number;
      startColumnIndex: number;
      endColumnIndex: number;
    };
    mergeType: string;
  };
  addSheet?: {
    properties: {
      title: string;
      gridProperties?: {
        rowCount: number;
        columnCount: number;
      };
      index?: number;
    };
  };
  deleteSheet?: {
    sheetId: number;
  };
  updateSheetProperties?: {
    properties: {
      sheetId: number;
      index: number;
    };
    fields: string;
  };
  updateDimensionProperties?: {
    range: {
      sheetId: number;
      dimension: string;
      startIndex: number;
      endIndex: number;
    };
    properties: {
      pixelSize: number;
    };
    fields: string;
  };
}>;

export interface SheetData {
  properties: {
    title: string;
    sheetId: number;
  };
}
