declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown>;
    text: string;
    version: string;
  }

  interface PDFOptions {
    max?: number;
    version?: string;
    pagerender?: (pageData: unknown) => string;
  }

  function pdf(dataBuffer: Buffer, options?: PDFOptions): Promise<PDFData>;
  
  export = pdf;
}
