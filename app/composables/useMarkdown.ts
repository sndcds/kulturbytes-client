import MarkdownIt from 'markdown-it'
import DOMPurify from 'isomorphic-dompurify'

const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
})

export function useMarkdown() {
    function renderMarkdown(markdown: string) {
        const html = md.render(markdown)

        return DOMPurify.sanitize(html)
    }

    return {
        renderMarkdown,
    }
}