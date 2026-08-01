export default defineNuxtPlugin(() => {

    const config = useRuntimeConfig()

    const api = $fetch.create({
        baseURL: config.public.apiUrl,

        onRequest({ options }) {

            const headers =
                new Headers(options.headers || {})

            if (
                import.meta.client
            ) {
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
        provide:{
            api
        }
    }
})