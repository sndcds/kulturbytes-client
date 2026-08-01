import DOMPurify from 'dompurify'

export default defineNuxtPlugin(() => {
    return {
        provide: {
            sanitizeHtml(html: string) {
                return DOMPurify.sanitize(html)
            }
        }
    }
})