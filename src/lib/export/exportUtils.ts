import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import TurndownService from 'turndown';

export interface ExportOptions {
  title: string;
  content: string;
  settings?: {
    fontFamily?: string;
    fontSize?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
  };
}

/**
 * Export document content as Markdown
 */
export function exportAsMarkdown(options: ExportOptions): string {
  const { title, content } = options;
  
  // If content is already HTML, convert to markdown
  if (content.includes('<') && content.includes('>')) {
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
    });
    
    // Add custom rules for better conversion
    turndownService.addRule('strikethrough', {
      filter: ['del', 's'],
      replacement: (content) => `~~${content}~~`
    });
    
    turndownService.addRule('highlight', {
      filter: (node) => {
        const element = node as HTMLElement;
        return element.nodeName === 'MARK' || 
               (element.nodeName === 'SPAN' && element.style && element.style.backgroundColor) ? true : false;
      },
      replacement: (content) => `==${content}==`
    });
    
    const markdown = turndownService.turndown(content);
    return `# ${title}\n\n${markdown}`;
  }
  
  // If content is already markdown or plain text
  return `# ${title}\n\n${content}`;
}

/**
 * Download markdown file
 */
export function downloadMarkdown(options: ExportOptions): void {
  const markdown = exportAsMarkdown(options);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${options.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert HTML content to plain text for PDF/DOCX
 */
function htmlToPlainText(html: string): string {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Extract text content while preserving some structure
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  return textContent.trim();
}

/**
 * Parse HTML content and extract structured elements
 */
function parseHtmlContent(html: string): Array<{ type: string; content: string; level?: number }> {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  const elements: Array<{ type: string; content: string; level?: number }> = [];
  
  function processNode(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        elements.push({ type: 'text', content: text });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();
      
      switch (tagName) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          const level = parseInt(tagName.charAt(1));
          elements.push({ 
            type: 'heading', 
            content: element.textContent || '', 
            level 
          });
          break;
        case 'p':
          elements.push({ 
            type: 'paragraph', 
            content: element.textContent || '' 
          });
          break;
        case 'br':
          elements.push({ type: 'break', content: '' });
          break;
        default:
          // For other elements, process children
          Array.from(element.childNodes).forEach(processNode);
          break;
      }
    }
  }
  
  Array.from(tempDiv.childNodes).forEach(processNode);
  return elements;
}

/**
 * Export document as PDF
 */
export async function exportAsPDF(options: ExportOptions): Promise<void> {
  const { title, content, settings = {} } = options;
  
  // Create new PDF document
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Set up margins and dimensions
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginLeft = settings.marginLeft ? settings.marginLeft * 25.4 : 20; // Convert inches to mm
  const marginRight = settings.marginRight ? settings.marginRight * 25.4 : 20;
  const marginTop = settings.marginTop ? settings.marginTop * 25.4 : 20;
  const marginBottom = settings.marginBottom ? settings.marginBottom * 25.4 : 20;
  
  const contentWidth = pageWidth - marginLeft - marginRight;
  let currentY = marginTop;
  
  // Set font
  pdf.setFont('helvetica');
  
  // Add title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  const titleLines = pdf.splitTextToSize(title, contentWidth);
  pdf.text(titleLines, marginLeft, currentY);
  currentY += titleLines.length * 8 + 10;
  
  // Process content
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(settings.fontSize || 12);
  
  const elements = parseHtmlContent(content);
  
  for (const element of elements) {
    // Check if we need a new page
    if (currentY > pageHeight - marginBottom - 20) {
      pdf.addPage();
      currentY = marginTop;
    }
    
    switch (element.type) {
      case 'heading':
        const headingSize = Math.max(14 - (element.level || 1), 10);
        pdf.setFontSize(headingSize);
        pdf.setFont('helvetica', 'bold');
        const headingLines = pdf.splitTextToSize(element.content, contentWidth);
        pdf.text(headingLines, marginLeft, currentY);
        currentY += headingLines.length * (headingSize * 0.35) + 5;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(settings.fontSize || 12);
        break;
        
      case 'paragraph':
        if (element.content.trim()) {
          const paragraphLines = pdf.splitTextToSize(element.content, contentWidth);
          pdf.text(paragraphLines, marginLeft, currentY);
          currentY += paragraphLines.length * 5 + 3;
        }
        break;
        
      case 'text':
        if (element.content.trim()) {
          const textLines = pdf.splitTextToSize(element.content, contentWidth);
          pdf.text(textLines, marginLeft, currentY);
          currentY += textLines.length * 5;
        }
        break;
        
      case 'break':
        currentY += 5;
        break;
    }
  }
  
  // If no structured content was found, fall back to plain text
  if (elements.length === 0) {
    const plainText = htmlToPlainText(content);
    const lines = pdf.splitTextToSize(plainText, contentWidth);
    
    for (let i = 0; i < lines.length; i++) {
      if (currentY > pageHeight - marginBottom) {
        pdf.addPage();
        currentY = marginTop;
      }
      pdf.text(lines[i], marginLeft, currentY);
      currentY += 5;
    }
  }
  
  // Save the PDF
  const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
  pdf.save(fileName);
}

/**
 * Export document as DOCX
 */
export async function exportAsDOCX(options: ExportOptions): Promise<void> {
  const { title, content, settings = {} } = options;
  
  // Parse HTML content into structured elements
  const elements = parseHtmlContent(content);
  
  // Create document paragraphs
  const docParagraphs: Paragraph[] = [];
  
  // Add title
  docParagraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 32, // 16pt in half-points
        }),
      ],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );
  
  // Process content elements
  for (const element of elements) {
    switch (element.type) {
      case 'heading':
        const headingLevel = Math.min(element.level || 1, 6) as 1 | 2 | 3 | 4 | 5 | 6;
        const headingLevels = [
          HeadingLevel.HEADING_1,
          HeadingLevel.HEADING_2,
          HeadingLevel.HEADING_3,
          HeadingLevel.HEADING_4,
          HeadingLevel.HEADING_5,
          HeadingLevel.HEADING_6,
        ];
        
        docParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: element.content,
                bold: true,
                size: Math.max(24 - (headingLevel * 2), 20), // Decreasing size for lower headings
              }),
            ],
            heading: headingLevels[headingLevel - 1],
            spacing: { before: 240, after: 120 },
          })
        );
        break;
        
      case 'paragraph':
        if (element.content.trim()) {
          docParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: element.content,
                  size: (settings.fontSize || 12) * 2, // Convert to half-points
                }),
              ],
              spacing: { after: 120 },
            })
          );
        }
        break;
        
      case 'text':
        if (element.content.trim()) {
          docParagraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: element.content,
                  size: (settings.fontSize || 12) * 2,
                }),
              ],
            })
          );
        }
        break;
        
      case 'break':
        docParagraphs.push(new Paragraph({ children: [] }));
        break;
    }
  }
  
  // If no structured content was found, fall back to plain text
  if (elements.length === 0) {
    const plainText = htmlToPlainText(content);
    const paragraphs = plainText.split('\n\n');
    
    for (const para of paragraphs) {
      if (para.trim()) {
        docParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: para.trim(),
                size: (settings.fontSize || 12) * 2,
              }),
            ],
            spacing: { after: 120 },
          })
        );
      }
    }
  }
  
  // Create the document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docParagraphs,
      },
    ],
    creator: 'AI Writing Assistant',
    title: title,
    description: 'Document exported from AI Writing Assistant',
  });
  
  // Generate and download the document
  const buffer = await Packer.toBuffer(doc);
  const uint8Array = new Uint8Array(buffer);
  const blob = new Blob([uint8Array], { 
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy document link to clipboard
 */
export async function copyDocumentLink(documentId: string): Promise<void> {
  const url = `${window.location.origin}/content/${documentId}`;
  
  try {
    await navigator.clipboard.writeText(url);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}