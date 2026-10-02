// src/lib/fileParser.ts
// In-memory document extraction for PDF, DOCX, and TXT files.
// Designed to run in a Node.js serverless environment (not Edge).
// Ensures no files are written to disk to maintain strict privacy compliance.

// @ts-ignore - TS1192: pdf-parse lacks a default export in some TS configurations. 
// If you prefer, you can enable 'esModuleInterop' in your tsconfig.json.
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Normalizes extracted text to prevent parsing hallucinations and reduce token count.
 * - Removes null characters
 * - Standardizes line endings
 * - Collapses excessive horizontal whitespace
 * - Limits consecutive newlines
 */
function normalizeText(text: string): string {
  return text
    .replace(/\u0000/g, '') // Strip null bytes
    .replace(/\r\n/g, '\n') // Standardize line endings
    .replace(/[^\S\r\n]+/g, ' ') // Collapse multiple spaces into one (preserve newlines)
    .replace(/\n{3,}/g, '\n\n') // Collapse 3+ newlines into maximum 2
    .trim();
}

/**
 * Extracts raw text from a document buffer.
 * 
 * @param buffer The file data as a Node.js Buffer
 * @param mimeType The MIME type of the uploaded file
 * @param filename The original filename (used as a fallback for type detection)
 * @returns The cleaned, extracted text string
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<string> {
  let extractedText = '';
  const lowerFilename = filename.toLowerCase();

  try {
    // 1. PDF Extraction
    if (mimeType === 'application/pdf' || lowerFilename.endsWith('.pdf')) {
      // pdf-parse expects a Buffer
      const pdfData = await pdfParse(buffer, {
        // Disable page rendering/metadata logs to speed up extraction
        // cspell:disable-next-line
        pagerender: (pageData: any) => pageData.getTextContent().then((textContent: any) => {
          let lastY, text = '';
          for (const item of textContent.items) {
            if (lastY == item.transform[5] || !lastY) {
              text += item.str;
            } else {
              text += '\n' + item.str;
            }
            lastY = item.transform[5];
          }
          return text;
        }),
      });
      extractedText = pdfData.text;
    } 
    
    // 2. DOCX Extraction
    else if (
      // cspell:disable
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      // cspell:enable
      mimeType === 'application/msword' || // legacy .doc fallback
      lowerFilename.endsWith('.docx') ||
      lowerFilename.endsWith('.doc')
    ) {
      // Mammoth extracts DOCX XML into clean raw text
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
      
      if (result.messages && result.messages.length > 0) {
        console.warn(`[FileParser] Mammoth warnings for ${filename}:`, result.messages);
      }
    } 
    
    // 3. Plain Text / Rich Text Extraction
    else if (
      mimeType === 'text/plain' ||
      mimeType === 'text/rtf' ||
      lowerFilename.endsWith('.txt') ||
      lowerFilename.endsWith('.rtf')
    ) {
      extractedText = buffer.toString('utf-8');
    } 
    
    // 4. Unsupported
    else {
      throw new Error(`Unsupported file type. Received MIME: ${mimeType}`);
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No readable text could be extracted from this document.');
    }

    return normalizeText(extractedText);

  } catch (error) {
    console.error(`[FileParser] Failed to extract text from ${filename}:`, error);
    throw new Error(
      error instanceof Error 
        ? `Extraction failed: ${error.message}` 
        : 'Unknown error occurred during document extraction'
    );
  }
}

/**
 * Convenience wrapper for Next.js App Router API Handlers receiving standard Web API File objects.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  return extractTextFromBuffer(buffer, file.type, file.name);
}