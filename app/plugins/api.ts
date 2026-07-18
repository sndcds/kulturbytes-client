export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()

    const accessToken = useCookie<string | null>('access_token')
    const refreshToken = useCookie<string | null>('refresh_token')

    let refreshPromise: Promise<void> | null = null

    let api: ReturnType<typeof $fetch.create>
    api = $fetch.create({
        baseURL: config.public.apiUrl,

        onRequest({ options }) {
            const headers = new Headers(options.headers || {})

            if (accessToken.value) {
                headers.set('Authorization', `Bearer ${accessToken.value}`)
            }

            if (
                options.body &&
                !(options.body instanceof FormData) &&
                !headers.has('Content-Type')
            ) {
                headers.set('Content-Type', 'application/json')
            }

            options.headers = headers
        },

        async onResponseError({ response, request, options }) {
            if (response?.status !== 401) return

            const url = String(request)

            if (url.includes('/login') || url.includes('/refresh')) {
                throw new Error('Auth endpoint failed')
            }

            if (!refreshPromise) {
                refreshPromise = refreshTokens()
            }

            await refreshPromise
            refreshPromise = null

            return api(request as any, options as any)
        }
    })

    async function refreshTokens() {
        if (!refreshToken.value) {
            accessToken.value = null
            await navigateTo('/login')
            throw new Error('Missing refresh token')
        }

        const res = await $fetch<{ access_token: string; refresh_token?: string }>(
            `${config.public.apiUrl}/api/admin/refresh`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${refreshToken.value}`
                }
            }
        )

        accessToken.value = res.access_token
        if (res.refresh_token) refreshToken.value = res.refresh_token
    }

    return {
        provide: {
            api
        }
    }
})