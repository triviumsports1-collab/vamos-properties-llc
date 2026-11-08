import "server-only";

import { getGoogleSheetId, getGoogleSheetsClient, googleSheetsConfigured, sheetA1Range } from "@/lib/gdoc-listings/google";

export async function fetchSheetValueRows(): Promise<string[][]> {
  if (!googleSheetsConfigured()) {
    throw new Error("missing_credentials");
  }

  const sheets = getGoogleSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getGoogleSheetId(),
    range: sheetA1Range("A1:AZ"),
    majorDimension: "ROWS",
    valueRenderOption: "FORMATTED_VALUE",
  });

  return (response.data.values ?? []).map((row) => row.map((cell) => String(cell ?? "")));
}
