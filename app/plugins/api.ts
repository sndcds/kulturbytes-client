export default defineNuxtPlugin(() => {

    const config = useRuntimeConfig()

    // Original browser request headers (SSR only)
    const requestHeaders = import.meta.server
        ? useRequestHeaders([
            'referer',
            'user-agent',
            'accept-language',
        ])
        : {}

    const api = $fetch.create({
        baseURL: config.public.apiBase,

        onRequest({ request, options }) {

            // Identify where the API request originates.
            // SSR requests are executed by the Nuxt server during server-side rendering.
            // Client requests are executed directly by the visitor's browser.
            // This information is passed as a query parameter so the API can
            // distinguish both request types when recording event accesses.
            options.query = {
                ...options.query,
                request_mode: import.meta.server ? 'ssr' : 'client'
            }

            const headers = new Headers(options.headers || {})

            // Log API requests for debugging
            console.log('[API REQUEST]', {
                side: import.meta.server ? 'SSR' : 'CLIENT',
                url: String(request),
                method: options.method || 'GET',
                requestSource: import.meta.server
                    ? 'frontend-ssr'
                    : 'frontend-client',
                timestamp: new Date().toISOString(),
            })

            // Forward original visitor information during SSR
            if (import.meta.server) {
                for (const [key, value] of Object.entries(requestHeaders)) {
                    if (value) {
                        headers.set(key, value)
                    }
                }

                headers.set(
                    'X-Kulturbytes-Request-Source',
                    'frontend-ssr'
                )
            }

            if (import.meta.client) {
                const accessToken =  useCookie<string | null>('access_token')

                if (accessToken.value) {
                    headers.set(
                        'Authorization',
                        `Bearer ${accessToken.value}`
                    )
                }
            }

            if (options.body &&
                !(options.body instanceof FormData) &&
                !headers.has('Content-Type')
            ) {
                headers.set(
                    'Content-Type',
                    'application/json'
                )
            }

            options.headers = headers
        }
    })

    return {
        provide: {
            api
        }
    }
})