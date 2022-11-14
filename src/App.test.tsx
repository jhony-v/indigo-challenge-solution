import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const getPreview = () => screen.getByTestId('preview');

const getTextarea = () => screen.getByRole('textbox');

const existsElements = (element: HTMLElement, tags: string[]) => {
  tags.forEach((tag) => {
    expect(element.innerHTML).toContain(`<${tag}>`);
  });
};

describe('Markdown editor', () => {
  test('renders text input', () => {
    render(<App />);
    const textarea = getTextarea();
    expect(textarea).toBeInTheDocument();
  });

  test('renders title in preview', () => {
    render(<App />);
    const textarea = getTextarea();
    userEvent.type(textarea, `# markdown guide`);

    const preview = getPreview();
    expect(preview).toContainHTML('<h1>markdown guide</h1>');
  });

  test('renders subtitle in preview', () => {
    render(<App />);
    const textarea = getTextarea();
    userEvent.type(textarea, `## markdown subtitle`);

    const preview = getPreview();
    expect(preview).toContainHTML('<h2>markdown subtitle</h2>');
  });

  test('renders lists in preview using the * symbol', () => {
    render(<App />);
    const textarea = getTextarea();
    userEvent.type(
      textarea,
      `
    * item 1
    * item 2
    `.trim(),
    );

    const preview = getPreview();
    expect(preview.innerHTML).toContain('item 1');
    expect(preview.innerHTML).toContain('item 2');
    expect(preview).toContainHTML(`<ul><li>item 1</li><li>item 2</li></ul>`);
  });

  test('renders lists in preview using the - symbol', () => {
    render(<App />);
    const textarea = getTextarea();
    userEvent.type(
      textarea,
      `
    - item 1
    - item 2
    `.trim(),
    );

    const preview = getPreview();
    expect(preview.innerHTML).toContain('item 1');
    expect(preview.innerHTML).toContain('item 2');
    expect(preview).toContainHTML(`<ul><li>item 1</li><li>item 2</li></ul>`);
  });

  test('renders blocks in preview', () => {
    render(<App />);
    const textarea = getTextarea();
    userEvent.type(
      textarea,
      `
    hello
    second
    `.trim(),
    );

    const preview = getPreview();
    expect(preview).toHaveTextContent('hello');
    expect(preview).toContainHTML(`<p>hello</p><p>second</p>`);
  });

  test('renders multiple title and blocks', () => {
    render(<App />);
    const textarea = getTextarea();
    userEvent.type(
      textarea,
      `
    # title
    ## subtitle
    message
    `.trim(),
    );

    const preview = getPreview();
    expect(preview).toHaveTextContent('title');
    expect(preview).toHaveTextContent('subtitle');
    expect(preview).toHaveTextContent('message');
    expect(preview).toContainHTML(`<h1>title</h1><h2>subtitle</h2><p>message</p>`);
  });

  test('should update new markdown content by changing the input', () => {
    render(<App />);
    const textarea = getTextarea();
    userEvent.type(
      textarea,
      `
    # heading 1
      this is a block
    `.trim(),
    );

    let preview = getPreview();
    expect(preview).toHaveTextContent('heading 1');
    expect(preview).toHaveTextContent('this is a block');
    existsElements(preview, ['h1', 'p']);

    userEvent.clear(textarea);

    preview = getPreview();
    expect(preview).toBeEmptyDOMElement();

    userEvent.type(
      textarea,
      `
    ## heading 2 
    * item 1
    * item 2
    `.trim(),
      {},
    );

    preview = getPreview();
    expect(preview).not.toHaveTextContent('heading 1');
    expect(preview).not.toHaveTextContent('this is a block');
    expect(preview).toHaveTextContent('heading 2');
    expect(preview).toHaveTextContent('item 1');
    expect(preview).toHaveTextContent('item 2');
    existsElements(preview, ['h2', 'ul', 'li']);
  });
});
