import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import { DocTypeConfig, DocumentState, PartyData } from "./doc-configs/types";
import { buildTemplateValues, substituteTemplate } from "./template-engine";

/** Strip all HTML tags and decode basic entities to plain text. */
function stripHtml(html: string): string {
  return html
    .replace(/<span[^>]*>([^<]*)<\/span>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** Split text into TextRun segments, handling **bold** and *italic* markers. */
function parseInlineMarkdown(text: string): TextRun[] {
  const runs: TextRun[] = [];
  // Split on ** and * markers
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  for (const part of parts) {
    if (part.startsWith("**") && part.endsWith("**")) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
    } else if (part.startsWith("*") && part.endsWith("*")) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
    } else if (part) {
      runs.push(new TextRun({ text: part }));
    }
  }
  return runs.length > 0 ? runs : [new TextRun({ text: "" })];
}

/** Convert a markdown string to an array of docx Paragraphs. */
function markdownToParagraphs(markdown: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const lines = markdown.split("\n");

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith("# ")) {
      paragraphs.push(
        new Paragraph({ text: line.slice(2), heading: HeadingLevel.HEADING_1 })
      );
    } else if (line.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_2 })
      );
    } else if (line.startsWith("### ")) {
      paragraphs.push(
        new Paragraph({ text: line.slice(4), heading: HeadingLevel.HEADING_3 })
      );
    } else if (line.trim() === "") {
      paragraphs.push(new Paragraph({ text: "" }));
    } else {
      const cleaned = stripHtml(line);
      paragraphs.push(new Paragraph({ children: parseInlineMarkdown(cleaned) }));
    }
  }
  return paragraphs;
}

/** Build a cover page info table row. */
function coverRow(label: string, value: string): TableRow {
  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
  };
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 35, type: WidthType.PERCENTAGE },
        borders: cellBorder,
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
      }),
      new TableCell({
        width: { size: 65, type: WidthType.PERCENTAGE },
        borders: cellBorder,
        children: [new Paragraph({ text: value || "—" })],
      }),
    ],
  });
}

/** Build a party info table row pair. */
function partyRows(label: string, party: PartyData | undefined): TableRow[] {
  if (!party) return [];
  return [
    coverRow(`${label} Name`, party.name),
    coverRow(`${label} Title`, party.title),
    coverRow(`${label} Company`, party.company),
    coverRow(`${label} Address`, party.noticeAddress),
    coverRow(`${label} Date`, party.date),
  ];
}

export async function downloadDocx(config: DocTypeConfig, state: DocumentState): Promise<void> {
  const values = buildTemplateValues(
    config.fields,
    state,
    config.computedTemplateValues
  );
  const renderedMarkdown = substituteTemplate(config.templateContent, values);

  // Cover page rows
  const coverRows: TableRow[] = [];

  // Fields that appear on cover page
  const coverFields = config.fields
    .filter((f) => f.coverPageOrder !== undefined)
    .sort((a, b) => (a.coverPageOrder ?? 0) - (b.coverPageOrder ?? 0));

  for (const field of coverFields) {
    coverRows.push(coverRow(field.coverPageLabel ?? field.label, state.fields[field.key] ?? ""));
  }

  if (config.coverPage.showSignatures) {
    coverRows.push(
      ...partyRows(config.coverPage.partyALabel, state.partyA),
      ...partyRows(config.coverPage.partyBLabel, state.partyB)
    );
  }

  const children: (Paragraph | Table)[] = [
    new Paragraph({ text: config.displayName, heading: HeadingLevel.TITLE }),
    new Paragraph({ text: "Common Paper Standard Terms", alignment: AlignmentType.CENTER }),
    new Paragraph({ text: "" }),
  ];

  if (coverRows.length > 0) {
    children.push(
      new Paragraph({ text: "Cover Page", heading: HeadingLevel.HEADING_1 }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: coverRows,
      }),
      new Paragraph({ text: "" })
    );
  }

  children.push(...markdownToParagraphs(renderedMarkdown));

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  const filename = config.displayName.replace(/[^a-z0-9]/gi, "-").toLowerCase() + ".docx";
  saveAs(blob, filename);
}
