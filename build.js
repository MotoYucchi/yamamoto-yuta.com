import fs from 'fs-extra';
import { marked } from 'marked';
import path from 'path';
import matter from 'gray-matter';

const SRC_DIR = './src';
const OUT_DIR = './public';

async function build() {
  try {
    // 1. Clean public directory
    await fs.emptyDir(OUT_DIR);

    // 2. Read Markdown and Template
    const markdownRaw = await fs.readFile(path.join(SRC_DIR, 'index.md'), 'utf-8');
    const templateContent = await fs.readFile(path.join(SRC_DIR, 'template.html'), 'utf-8');

    // 3. Parse Frontmatter and content
    const { data, content } = matter(markdownRaw);

    // 4. Process custom language tags :::ja and :::en
    let processedContent = content;
    processedContent = processedContent.replace(/:::ja\r?\n([\s\S]*?)\r?\n:::/g, '<div class="lang-ja">\n\n$1\n\n</div>');
    processedContent = processedContent.replace(/:::en\r?\n([\s\S]*?)\r?\n:::/g, '<div class="lang-en">\n\n$1\n\n</div>');

    // 5. Parse Markdown to HTML
    const htmlContent = marked(processedContent);

    // 6. Inject HTML into Template
    let finalHtml = templateContent.replace('<!-- MARKDOWN_CONTENT -->', htmlContent);

    // 7. Inject SEO tags from Frontmatter
    const title = data.title || 'Yuta Yamamoto - Portfolio';
    const description = data.description || '';
    const keywordsStr = data.keywords ? data.keywords.join(', ') : '';
    const keywordsJson = data.keywords ? JSON.stringify(data.keywords) : '[]';

    finalHtml = finalHtml.replace(/<!-- SEO_TITLE -->/g, title);
    finalHtml = finalHtml.replace(/<!-- SEO_DESCRIPTION -->/g, description);
    finalHtml = finalHtml.replace(/<!-- SEO_KEYWORDS -->/g, keywordsStr);
    finalHtml = finalHtml.replace(/<!-- JSON_KEYWORDS -->/g, keywordsJson);

    // 8. Write to public directory
    await fs.writeFile(path.join(OUT_DIR, 'index.html'), finalHtml);

    // 9. Copy assets (css, js)
    await fs.copy(path.join(SRC_DIR, 'css'), path.join(OUT_DIR, 'css'));
    await fs.copy(path.join(SRC_DIR, 'js'), path.join(OUT_DIR, 'js'));

    // 10. Copy favicon
    const faviconPath = path.join(SRC_DIR, 'YYPortfolio-favicon.png');
    if (await fs.pathExists(faviconPath)) {
      await fs.copy(faviconPath, path.join(OUT_DIR, 'favicon.png'));
    }

    // 11. Generate robots.txt
    const SITE_URL = 'https://yamamoto-yuta.com';
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
    await fs.writeFile(path.join(OUT_DIR, 'robots.txt'), robotsTxt);

    // 12. Generate sitemap.xml (Monthly change frequency)
    const today = new Date().toISOString().split('T')[0];
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    await fs.writeFile(path.join(OUT_DIR, 'sitemap.xml'), sitemapXml);

    console.log('Build completed successfully! Check the /public directory.');
  } catch (error) {
    console.error('Build failed:', error);
  }
}

build();
