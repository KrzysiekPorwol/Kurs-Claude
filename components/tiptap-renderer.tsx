import { type ReactNode } from "react";

type Mark = {
  type: "bold" | "italic" | "code";
};

type TextNode = {
  type: "text";
  text: string;
  marks?: Mark[];
};

type DocNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
};

type TipTapNode = TextNode | DocNode;

export type TipTapDoc = {
  type: "doc";
  content?: TipTapNode[];
};

function applyMarks(text: string, marks: Mark[] = []): ReactNode {
  let node: ReactNode = text;
  for (const mark of marks) {
    if (mark.type === "bold") node = <strong>{node}</strong>;
    else if (mark.type === "italic") node = <em>{node}</em>;
    else if (mark.type === "code")
      node = (
        <code className="rounded bg-neutral-800 px-1 py-0.5 font-mono text-sm text-neutral-200">
          {node}
        </code>
      );
  }
  return node;
}

function renderNode(node: TipTapNode, index: number): ReactNode {
  if (node.type === "text") {
    const textNode = node as TextNode;
    return (
      <span key={index}>{applyMarks(textNode.text, textNode.marks)}</span>
    );
  }

  const docNode = node as DocNode;
  const children = docNode.content?.map((child, i) => renderNode(child, i));

  switch (docNode.type) {
    case "doc":
      return <>{children}</>;
    case "paragraph":
      return (
        <p key={index} className="mb-3 leading-relaxed text-neutral-200">
          {children}
        </p>
      );
    case "heading": {
      const level = (docNode.attrs?.level as number) ?? 1;
      const headingClass: Record<number, string> = {
        1: "mb-4 mt-6 text-2xl font-bold text-neutral-100",
        2: "mb-3 mt-5 text-xl font-semibold text-neutral-100",
        3: "mb-2 mt-4 text-lg font-semibold text-neutral-100",
      };
      const cls = headingClass[level] ?? headingClass[1];
      if (level === 1) return <h1 key={index} className={cls}>{children}</h1>;
      if (level === 2) return <h2 key={index} className={cls}>{children}</h2>;
      return <h3 key={index} className={cls}>{children}</h3>;
    }
    case "bulletList":
      return (
        <ul key={index} className="mb-3 list-disc pl-6 text-neutral-200">
          {children}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={index} className="mb-3 list-decimal pl-6 text-neutral-200">
          {children}
        </ol>
      );
    case "listItem":
      return <li key={index} className="mb-1">{children}</li>;
    case "codeBlock":
      return (
        <pre
          key={index}
          className="mb-3 overflow-x-auto rounded-md bg-neutral-800 p-4 font-mono text-sm text-neutral-200"
        >
          <code>{children}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={index} className="my-4 border-neutral-700" />;
    default:
      return <>{children}</>;
  }
}

export default function TipTapRenderer({ content }: { content: TipTapDoc }) {
  return (
    <div className="min-h-[120px]">
      {content.content?.map((node, i) => renderNode(node, i))}
    </div>
  );
}
