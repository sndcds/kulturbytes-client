import { describe, expect, it } from 'vitest'
import { useMarkdown } from '../../app/composables/useMarkdown'

const { renderMarkdown } = useMarkdown()

describe('SSR Markdown rendering', () => {
  it('renders supported formatting and safe links', () => {
    const html = renderMarkdown('**Kultur** [Programm](https://kulturbytes.de)')
    expect(html).toContain('<strong>Kultur</strong>')
    expect(html).toContain('href="https://kulturbytes.de"')
  })

  it.each(['<script>alert(1)</script>', '<img src=x onerror=alert(1)>', '<svg onload=alert(1)>'])
  ('escapes supplied HTML before it reaches v-html: %s', (input) => {
    const html = renderMarkdown(input)
    expect(html).not.toMatch(/<(script|img|svg)\b/i)
    expect(html).toContain('&lt;')
  })

  it.each(['javascript:alert(1)', 'data:text/html;base64,PHNjcmlwdD4='])
  ('does not emit unsafe Markdown link protocols: %s', (url) => {
    expect(renderMarkdown(`[link](${url})`)).not.toContain('href=')
  })
})
