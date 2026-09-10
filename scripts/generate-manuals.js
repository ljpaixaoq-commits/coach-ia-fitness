import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { jsPDF } from 'jspdf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const docsDir = path.resolve(rootDir, 'docs');

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// 1. Helper to generate DOCX
async function generateDocx(title, mdContent, outputPath) {
  const lines = mdContent.split('\n');
  const paragraphs = [];

  paragraphs.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300, before: 100 }
    })
  );

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      paragraphs.push(new Paragraph({ text: '', spacing: { after: 100 } }));
      continue;
    }

    if (trimmed.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace('# ', ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 }
        })
      );
    } else if (trimmed.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace('## ', ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        })
      );
    } else if (trimmed.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace('### ', ''),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 }
        })
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: '•  ', bold: true, color: '2563EB' }),
            new TextRun({ text: trimmed.substring(2) })
          ],
          indent: { left: 400 },
          spacing: { after: 60 }
        })
      );
    } else if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ') || trimmed.startsWith('4. ') || trimmed.startsWith('5. ')) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: trimmed.substring(0, 3), bold: true, color: '10B981' }),
            new TextRun({ text: trimmed.substring(3) })
          ],
          indent: { left: 400 },
          spacing: { after: 60 }
        })
      );
    } else if (trimmed.startsWith('```')) {
      // code block delimiter
    } else {
      paragraphs.push(
        new Paragraph({
          text: trimmed,
          spacing: { after: 80 }
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`DOCX gerado: ${outputPath}`);
}

// 2. Helper to generate PDF
function generatePdf(title, mdContent, outputPath) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const maxLineWidth = pageWidth - margin * 2;
  let cursorY = 50;

  // Header banner
  doc.setFillColor(15, 23, 42); // #0F172A
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('COACH IA PESSOAL | DOCUMENTAÇÃO OFICIAL', margin, 25);

  cursorY = 70;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(title, margin, cursorY);
  cursorY += 25;

  const lines = mdContent.split('\n');

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      cursorY += 6;
      continue;
    }

    if (cursorY > pageHeight - 50) {
      doc.addPage();
      // header on subsequent pages
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('COACH IA PESSOAL', margin, 20);
      cursorY = 55;
    }

    if (trimmed.startsWith('# ')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(37, 99, 235); // Blue
      doc.text(trimmed.replace('# ', ''), margin, cursorY);
      cursorY += 18;
    } else if (trimmed.startsWith('## ')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(trimmed.replace('## ', ''), margin, cursorY);
      cursorY += 16;
    } else if (trimmed.startsWith('### ')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(51, 65, 85);
      doc.text(trimmed.replace('### ', ''), margin, cursorY);
      cursorY += 14;
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      const bulletText = '• ' + trimmed.substring(2);
      const splitText = doc.splitTextToSize(bulletText, maxLineWidth - 15);
      doc.text(splitText, margin + 15, cursorY);
      cursorY += splitText.length * 12 + 3;
    } else if (trimmed.startsWith('```')) {
      // skip code markers
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      const splitText = doc.splitTextToSize(trimmed, maxLineWidth);
      doc.text(splitText, margin, cursorY);
      cursorY += splitText.length * 12 + 3;
    }
  }

  doc.save(outputPath);
  console.log(`PDF gerado: ${outputPath}`);
}

async function main() {
  const configMd = fs.readFileSync(path.resolve(rootDir, 'MANUAL_CONFIGURACAO.md'), 'utf8');
  const utilMd = fs.readFileSync(path.resolve(rootDir, 'MANUAL_UTILIZACAO.md'), 'utf8');

  // Generate for docs/ and project root
  await generateDocx('Manual de Configuração - Coach IA Pessoal', configMd, path.resolve(docsDir, 'MANUAL_CONFIGURACAO.docx'));
  await generateDocx('Manual de Utilização - Coach IA Pessoal', utilMd, path.resolve(docsDir, 'MANUAL_UTILIZACAO.docx'));

  generatePdf('Manual de Configuração - Coach IA Pessoal', configMd, path.resolve(docsDir, 'MANUAL_CONFIGURACAO.pdf'));
  generatePdf('Manual de Utilização - Coach IA Pessoal', utilMd, path.resolve(docsDir, 'MANUAL_UTILIZACAO.pdf'));

  // Copy to root as well for easy access
  fs.copyFileSync(path.resolve(docsDir, 'MANUAL_CONFIGURACAO.docx'), path.resolve(rootDir, 'MANUAL_CONFIGURACAO.docx'));
  fs.copyFileSync(path.resolve(docsDir, 'MANUAL_CONFIGURACAO.pdf'), path.resolve(rootDir, 'MANUAL_CONFIGURACAO.pdf'));
  fs.copyFileSync(path.resolve(docsDir, 'MANUAL_UTILIZACAO.docx'), path.resolve(rootDir, 'MANUAL_UTILIZACAO.docx'));
  fs.copyFileSync(path.resolve(docsDir, 'MANUAL_UTILIZACAO.pdf'), path.resolve(rootDir, 'MANUAL_UTILIZACAO.pdf'));

  console.log('Todos os manuais em DOCX e PDF foram gerados com sucesso!');
}

main().catch(console.error);