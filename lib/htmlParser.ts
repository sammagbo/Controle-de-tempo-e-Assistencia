import JSZip from 'jszip';
import DOMPurify from 'dompurify';
import { MeetingPart, SectionKey } from './meetingTemplate';

/**
 * Parse EPUB file from JW Library workbook
 * EPUB is essentially a ZIP file containing HTML/XHTML content
 */
export const parseEpubWorkbook = async (file: File): Promise<Partial<MeetingPart>[]> => {
      try {
            const zip = new JSZip();
            const contents = await zip.loadAsync(file);

            // Find the main content file (usually in OEBPS folder)
            let htmlContent = '';

            for (const [path, zipEntry] of Object.entries(contents.files)) {
                  if (path.endsWith('.xhtml') || path.endsWith('.html')) {
                        if (!zipEntry.dir) {
                              const content = await zipEntry.async('string');
                              htmlContent += content;
                        }
                  }
            }

            if (!htmlContent) {
                  console.warn('No HTML content found in EPUB');
                  return [];
            }

            return parseHtmlContent(htmlContent);
      } catch (error) {
            console.error('Error parsing EPUB:', error);
            return [];
      }
};

/**
 * Parse HTML file directly (saved webpage from jw.org)
 */
export const parseHtmlWorkbook = async (file: File): Promise<Partial<MeetingPart>[]> => {
      try {
            const text = await file.text();
            return parseHtmlContent(text);
      } catch (error) {
            console.error('Error parsing HTML:', error);
            return [];
      }
};

/**
 * Parse HTML content to extract meeting parts
 */
const parseHtmlContent = (html: string): Partial<MeetingPart>[] => {
      const parts: Partial<MeetingPart>[] = [];

      // Sanitize HTML first
      const cleanHtml = DOMPurify.sanitize(html);

      // Create a DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanHtml, 'text/html');

      // Look for common JW.org patterns
      // The workbook typically has sections with specific classes or IDs

      // Pattern 1: Look for time indicators like "(5 min.)" or "(3-4 min.)"
      const timePattern = /\((\d+)(?:-\d+)?\s*min\.?\)/gi;

      // Pattern 2: Look for section headers
      const ministerioSection = doc.querySelector('[id*="ministry"], [class*="ministry"], .dc-icon--wheat');
      const vidaCristaSection = doc.querySelector('[id*="christian"], [class*="christian"], .dc-icon--sheep');

      // Get all text content
      const textContent = doc.body?.textContent || '';

      // Find Ministério section
      const ministerioMatch = textContent.match(/FA[ÇC]A\s*SEU\s*MELHOR\s*NO\s*MINIST[ÉE]RIO/i) ||
            textContent.match(/APPLIQUE-TOI\s*AU\s*MINIST[ÈE]RE/i);
      const vidaCristaMatch = textContent.match(/NOSSA\s*VIDA\s*CRIST[ÃA]/i) ||
            textContent.match(/VIE\s*CHR[ÉE]TIENNE/i);

      if (!ministerioMatch && !vidaCristaMatch) {
            // Try alternative parsing - look for list items with time
            const allElements = doc.querySelectorAll('p, li, div, span');
            let currentSection: SectionKey = 'ministerio';

            allElements.forEach((el, index) => {
                  const text = el.textContent?.trim() || '';
                  const timeMatch = text.match(/\((\d+)(?:-\d+)?\s*min\.?\)/);

                  if (timeMatch) {
                        // Found a part with time
                        let title = text.replace(timeMatch[0], '').trim();
                        const minutes = parseInt(timeMatch[1]);

                        // Clean up title
                        title = title.replace(/^\d+\.\s*/, ''); // Remove leading numbers
                        title = title.replace(/[:：]\s*$/, ''); // Remove trailing colons

                        if (title.length > 3 && title.length < 100) {
                              // Detect section change
                              if (text.toLowerCase().includes('vida') || text.toLowerCase().includes('chrétienne')) {
                                    currentSection = 'vida_crista';
                              }

                              parts.push({
                                    id: `html-${currentSection}-${index}`,
                                    title: title,
                                    estimatedMinutes: minutes,
                                    section: currentSection,
                                    allowsComments: currentSection === 'vida_crista',
                                    requiresPostComment: currentSection === 'ministerio'
                              });
                        }
                  }
            });
      }

      // Also try to extract from structured elements
      const structuredParts = doc.querySelectorAll('[data-pid], .du-color--gold, .du-color--teal');
      structuredParts.forEach((el, index) => {
            const text = el.textContent?.trim() || '';
            const timeMatch = text.match(/\((\d+)(?:-\d+)?\s*min\.?\)/);

            if (timeMatch) {
                  let title = text.replace(timeMatch[0], '').trim();
                  const minutes = parseInt(timeMatch[1]);

                  // Determine section by parent element color/class
                  const parentClasses = el.closest('[class*="color"]')?.className || '';
                  const section: SectionKey = parentClasses.includes('teal') ? 'vida_crista' : 'ministerio';

                  if (title.length > 3 && !parts.some(p => p.title === title)) {
                        parts.push({
                              id: `struct-${section}-${index}`,
                              title: title,
                              estimatedMinutes: minutes,
                              section: section,
                              allowsComments: section === 'vida_crista',
                              requiresPostComment: section === 'ministerio'
                        });
                  }
            }
      });

      return parts;
};

/**
 * Detect file type and parse accordingly
 */
export const parseWorkbookFile = async (file: File): Promise<Partial<MeetingPart>[]> => {
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.epub')) {
            return parseEpubWorkbook(file);
      } else if (fileName.endsWith('.html') || fileName.endsWith('.htm') || fileName.endsWith('.xhtml')) {
            return parseHtmlWorkbook(file);
      } else {
            console.warn('Unsupported file type:', fileName);
            return [];
      }
};
