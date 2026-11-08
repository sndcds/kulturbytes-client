export function useApiBase(): string {
    const config = useRuntimeConfig()
    return config.public.apiBase
}