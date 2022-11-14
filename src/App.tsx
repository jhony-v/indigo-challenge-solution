import { useState } from 'react';

type Block = {
  element: 'ul' | 'li' | 'p' | 'h1' | 'h2';
  children: (Block | string)[];
};

type BlockElement = Block['element'];

type MarkdownKey = '#' | '##' | '*' | '-' | '';

type LexicalNode = ReturnType<typeof analyzeLexicalContent>[number];

const ELEMENT = {
  ul: 'ul',
  li: 'li',
  p: 'p',
  h1: 'h1',
  h2: 'h2',
} as const;

const MARKDOWN_KEY = {
  '#': ELEMENT.h1,
  '##': ELEMENT.h2,
  '*': ELEMENT.li,
  '-': ELEMENT.li,
  '': ELEMENT.p,
} as const;

const id = () => String(Math.floor(Math.random() * Date.now()));

const parseLine = (line: string = '') => {
  let contentCleaned = line.trim();
  const [firstWord, ...restWords] = contentCleaned.split(' ');
  let element = MARKDOWN_KEY[firstWord as MarkdownKey];
  let content = restWords.join(' ');
  if (!element) {
    content = contentCleaned;
    element = MARKDOWN_KEY[''];
  }
  return {
    element,
    children: content,
  };
};

const analyzeLexicalContent = (content: string) => {
  const contentLines = content.split('\n').filter((line) => line !== '');

  return contentLines.map((line, index) => {
    const current = parseLine(line);
    const previous = parseLine(contentLines[index - 1]);

    return {
      ...current,
      is: (element: BlockElement) => current.element === element,
      previousNode: {
        ...previous,
        isEqualElement: current.element === previous.element,
      },
    };
  });
};

const createBlock = (node: LexicalNode): Block => ({
  element: node.element,
  children: [node.children],
});

const parseMarkdown = (markdown: string): Block[] => {
  const parseElements = analyzeLexicalContent(markdown);
  const newElements: Record<string, Block> = {};
  const elementsIds: Record<string, string> = {};

  parseElements.forEach((currentElement, index) => {
    const { previousNode } = currentElement;

    if (currentElement.is(ELEMENT.li)) {
      elementsIds[index] = previousNode.isEqualElement ? elementsIds[index - 1] : id();
      const elementId = elementsIds[index];
      const hasRepeatedElementId = elementId === elementsIds[index - 1];
      if (hasRepeatedElementId) {
        newElements[elementId].children = [
          ...newElements[elementId].children,
          createBlock(currentElement),
        ];
      } else {
        newElements[elementId] = {
          element: ELEMENT.ul,
          children: [createBlock(currentElement)],
        };
      }
      return;
    }

    const uniqueId = id();
    elementsIds[index] = uniqueId;
    newElements[uniqueId] = createBlock(currentElement);
  });

  const elementsValue = Object.keys(newElements).map((el) => newElements[el]);
  return elementsValue;
};

// Parse markdown in React components
const marked = (markdown: string): JSX.Element[] => {
  function renderNode(node: Block, index: number) {
    const { element: Element, children } = node;
    return (
      <Element key={index}>
        {children.map((subItem, index) => {
          if (typeof subItem === 'string') return subItem;
          return renderNode(subItem, index);
        })}
      </Element>
    );
  }

  return parseMarkdown(markdown).map(renderNode);
};

function App() {
  const [markdown, setMarkdown] = useState<string>('');

  return (
    <div className="editor">
      <textarea rows={5} className="editor__input" onChange={(e) => setMarkdown(e.target.value)} />
      <div className="editor__output" data-testid="preview">
        {marked(markdown)}
      </div>
    </div>
  );
}

export default App;
