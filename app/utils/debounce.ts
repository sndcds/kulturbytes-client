export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay = 400
) {
    let timer: ReturnType<typeof setTimeout>

    return (...args: Parameters<T>) => {
        clearTimeout(timer)

        timer = setTimeout(() => {
            fn(...args)
        }, delay)
    }
}