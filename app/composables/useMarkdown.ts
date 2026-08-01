import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
})

export function useMarkdown() {

    function renderMarkdown(markdown: string) {
        const html = md.render(markdown)

        if (import.meta.client) {
            const { $sanitizeHtml } = useNuxtApp()
            return $sanitizeHtml(html)
        }

        return html
    }

    return {
        renderMarkdown,
    }
}