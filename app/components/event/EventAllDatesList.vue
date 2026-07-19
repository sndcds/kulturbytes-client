<template>
  <div v-if="sortedDates.length > 1">
    <h3>
      {{ t('event.all_dates') }}
    </h3>

    <NuxtLink
        v-for="date in sortedDates"
        :key="date.uuid"
        class="kbts-event-view-date-row"
        :class="{ 'is-current': date.uuid === currentDate?.uuid }"
        :to="`/event/${date.event_uuid}/${date.slug}`"
    >
      <span>{{ formatDate(locale, date.start_date ?? '', 'numeric') }}</span>
      <span>{{ formatTime(locale, date.start_time) }}</span>
      <span>
        {{ date.venue_name }}
          <ReleaseChip
              v-if="date.release_status != 'released'"
              :release-status="date.release_status"
              style="margin-left: 1rem;"
              tiny
          />
      </span>
      <span>{{ date.venue_city }}</span>
    </NuxtLink>

  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { EventDate, EventItem, EventResponse } from '~/types/eventItem'
import { getStartDateTime } from '@/utils/date'
import {formatDate, formatTime} from '@/utils/formatDate'
import ReleaseChip from '~/components/event/ui/ReleaseChip.vue'

const { t, locale } = useI18n({ useScope: 'global' })

const props = withDefaults(defineProps<{
  dates?: EventDate[]
  currentDate?: EventDate | null
}>(), {
  dates: () => [],
})

const sortedDates = computed(() => {
  const allDates = [...props.dates]

  // Make sure the current date is included
  if (
      props.currentDate &&
      !allDates.some(d => d.uuid === props.currentDate?.uuid)
  ) {
    allDates.push(props.currentDate)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return allDates
      .map(date => ({
        ...date,
        _dt: getStartDateTime(date.start_date, date.start_time),
      }))
      .filter(date => date._dt && date._dt >= today)
      .sort((a, b) => a._dt!.getTime() - b._dt!.getTime())
})
</script>
