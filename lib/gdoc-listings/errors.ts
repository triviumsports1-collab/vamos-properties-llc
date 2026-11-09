export class SheetSyncError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "SheetSyncError";
    this.code = code;
  }
}

export function sheetSyncErrorCode(error: unknown) {
  if (error instanceof SheetSyncError) return error.code;
  if (error instanceof Error && error.message === "missing_credentials") return "missing_credentials";
  return "";
}
