import MarkdownIt from 'markdown-it'
import sanitizeHtml from 'sanitize-html'

const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
})

export function useMarkdown() {
    function renderMarkdown(markdown: string) {
        const html = md.render(markdown)

        return sanitizeHtml(html)
    }

    return {
        renderMarkdown,
    }
}