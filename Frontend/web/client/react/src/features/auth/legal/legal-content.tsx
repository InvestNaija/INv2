import type { ReactNode } from "react";

// Splits a raw legal-copy block (paragraphs separated by a blank line) into
// renderable blocks: a short, un-punctuated line is a section heading
// (numbered ones and un-numbered sub-headings like "SMS/Text Messaging
// Service" alike); a short line ending in ";" is a bullet-list item and
// gets grouped with its consecutive siblings into one <ul>; everything else
// is a paragraph. A "Label:" prefix within a paragraph (e.g.
// "Confidentiality:") is bolded inline.
const HEADING_PATTERN = /^\d+\.\s/;
const INLINE_LABEL_PATTERN = /^([A-Z][A-Za-z /'-]{2,40}):\s/;

const isHeading = (block: string) => {
  if (HEADING_PATTERN.test(block)) return true;
  return (
    block.length < 60 &&
    !block.endsWith(".") &&
    !block.endsWith(":") &&
    !block.endsWith(";") &&
    !block.includes(". ")
  );
};

const isListItem = (block: string) => /;\s*(and\/or|and|or)?\.?$/i.test(block.trim());

// Bolds a leading "Label:" inside a single block of text.
const renderInline = (block: string) => {
  const labelMatch = block.match(INLINE_LABEL_PATTERN);
  if (!labelMatch) return block;
  return (
    <>
      <strong className="font-semibold text-[#0F172A]">{labelMatch[1]}:</strong>
      {block.slice(labelMatch[0].length)}
    </>
  );
};

interface LegalContentProps {
  content: string;
}

const LegalContent = ({ content }: LegalContentProps) => {
  const blocks = content.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);

  const elements: ReactNode[] = [];
  let pendingListItems: string[] = [];

  const flushList = (key: string) => {
    if (pendingListItems.length === 0) return;
    elements.push(
      <ul key={key} className="list-disc space-y-[8px] pl-[22px]">
        {pendingListItems.map((item, i) => (
          <li
            key={i}
            className="text-[14px] sm:text-[15px] leading-[24px] sm:leading-[26px] text-[#475569]"
          >
            {renderInline(item)}
          </li>
        ))}
      </ul>,
    );
    pendingListItems = [];
  };

  blocks.forEach((block, index) => {
    if (isListItem(block)) {
      pendingListItems.push(block);
      return;
    }

    flushList(`list-${index}`);

    if (isHeading(block)) {
      elements.push(
        <h3
          key={index}
          className="mt-[8px] text-[17px] sm:text-[18px] font-bold text-[#0F172A] first:mt-0"
        >
          {block}
        </h3>,
      );
      return;
    }

    elements.push(
      <p
        key={index}
        className="text-[14px] sm:text-[15px] leading-[24px] sm:leading-[26px] text-[#475569]"
      >
        {renderInline(block)}
      </p>,
    );
  });
  flushList("list-end");

  return <div className="flex flex-col gap-[20px]">{elements}</div>;
};

export default LegalContent;
