export function eventSchemaStatus(releaseStatus: string) {
    switch (releaseStatus) {
        case 'cancelled':
            return 'https://schema.org/EventCancelled'

        case 'deferred':
            return 'https://schema.org/EventPostponed'

        case 'rescheduled':
            return 'https://schema.org/EventRescheduled'

        case 'inherited':
        case 'released':
        default:
            return 'https://schema.org/EventScheduled'
    }
}