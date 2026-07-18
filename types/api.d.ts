export {}

declare module '#app' {
    interface NuxtApp {
        $api: ReturnType<typeof $fetch.create>
    }
}