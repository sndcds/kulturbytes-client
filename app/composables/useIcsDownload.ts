// composables/useIcsDownload.ts

import { ref } from 'vue'
import { createIcsFileName } from '@/utils/ics'

export function useIcsDownload() {
    const isDownloadingIcs = ref(false)

    const { $api } = useNuxtApp()

    async function downloadIcs({
                                   eventUuid,
                                   eventDateUuid,
                                   title,
                                   locale,
                               }: {
        eventUuid: string
        eventDateUuid: string
        title: string
        locale: string
    }) {
        if (isDownloadingIcs.value) {
            return
        }

        isDownloadingIcs.value = true

        try {
            const apiPath =
                `/api/event/${eventUuid}/date/${eventDateUuid}/ics?lang=${locale}`

            const icsContent = await $api<string>(apiPath, {
                headers: {
                    Accept: 'text/calendar,*/*;q=0.8',
                },
            })

            if (
                typeof icsContent !== 'string' ||
                !icsContent.trim()
            ) {
                throw new Error('Empty ICS payload')
            }

            const blob = new Blob(
                [icsContent],
                {
                    type: 'text/calendar;charset=utf-8',
                },
            )

            const blobUrl = URL.createObjectURL(blob)

            const link = document.createElement('a')

            link.href = blobUrl
            link.download = createIcsFileName(
                title,
                eventDateUuid,
            )

            document.body.appendChild(link)

            link.click()

            document.body.removeChild(link)

            URL.revokeObjectURL(blobUrl)

        } catch (error) {
            console.error('Failed to download ICS file', error)

        } finally {
            isDownloadingIcs.value = false
        }
    }

    return {
        isDownloadingIcs,
        downloadIcs,
    }
}