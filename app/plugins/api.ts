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

        onRequest({ options }) {

            const headers = new Headers(options.headers || {})

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
                const accessToken =
                    useCookie<string | null>('access_token')

                if (accessToken.value) {
                    headers.set(
                        'Authorization',
                        `Bearer ${accessToken.value}`
                    )
                }
            }

            if (
                options.body &&
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