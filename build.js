import fs from 'fs-extra';
import { marked } from 'marked';
import path from 'path';

const SRC_DIR = './src';
const OUT_DIR = './public';

async function build() {
  try {
    // 1. Clean public directory
    await fs.emptyDir(OUT_DIR);

    // 2. Read Markdown and Template
    const markdownContent = await fs.readFile(path.join(SRC_DIR, 'index.md'), 'utf-8');
    const templateContent = await fs.readFile(path.join(SRC_DIR, 'template.html'), 'utf-8');

    // 3. Parse Markdown to HTML
    const htmlContent = marked(markdownContent);

    // 4. Inject HTML into Template
    const finalHtml = templateContent.replace('<!-- MARKDOWN_CONTENT -->', htmlContent);

    // 5. Write to public directory
    await fs.writeFile(path.join(OUT_DIR, 'index.html'), finalHtml);

    // 6. Copy assets (css, js)
    await fs.copy(path.join(SRC_DIR, 'css'), path.join(OUT_DIR, 'css'));
    await fs.copy(path.join(SRC_DIR, 'js'), path.join(OUT_DIR, 'js'));

    console.log('Build completed successfully! Check the /public directory.');
  } catch (error) {
    console.error('Build failed:', error);
  }
}

build();
