/**
 * PDF Parsing Provider Type Definitions
 */

/**
 * PDF Provider IDs
 */
export type PDFProviderId = 'unpdf' | 'mineru';

/**
 * PDF Provider Configuration
 */
export interface PDFProviderConfig {
  id: PDFProviderId;
  name: string;
  requiresApiKey: boolean;
  baseUrl?: string;
  icon?: string;
  features: string[]; // ['text', 'images', 'tables', 'formulas', 'layout-analysis', etc.]
}

/**
 * MinerU operating mode
 * - self-hosted: POST {baseUrl}/file_parse (multipart, synchronous)
 * - cloud-agent: mineru.net Agent API — no auth, async, markdown only
 * - cloud-precision: mineru.net Precision API — Bearer token, async, ZIP with images
 */
export type MinerUMode = 'self-hosted' | 'cloud-agent' | 'cloud-precision';

/**
 * PDF Parser Configuration for API calls
 */
export interface PDFParserConfig {
  providerId: PDFProviderId;
  apiKey?: string;
  baseUrl?: string;
  mineruMode?: MinerUMode;
}

// Note: ParsedPdfContent is imported from @/lib/types/pdf to avoid duplication
