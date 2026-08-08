<template>
  <div class="kbts-event-view-date-time">

    <!-- Single day -->
    <template v-if="model.type === 'single'">
      <h2 class="kbts-event-view-date-time__date">
        <span class="kbts-event-view-date-time__weekday">
          {{ formatWeekday(date.start_date) }}
        </span>
        {{ model.date }}
      </h2>

      <span v-if="model.time">
        {{ model.time }}
      </span>

      <span v-if="model.entry_time">
        {{ t('event.entry_time_label') }}: {{ model.entry_time }}
      </span>
    </template>

    <!-- Multiple days -->
    <template v-else>
      <h2 class="kbts-event-view-date-time__date">
        {{ model.start_date }}
      </h2>

      <p v-if="model.start_time">
        {{ model.start_time }}
      </p>

      <p v-if="model.entry_time">
        {{ t('event.entry_time_label') }}: {{ model.entry_time }}
      </p>

      <p v-if="model.end_date">
        {{ t('event.end_time_label') }}:
        {{ model.end_date }}
        <template v-if="model.end_time">
          , {{ model.end_time }}
        </template>
      </p>

      <p v-else-if="model.end_time">
        {{ t('event.end_time_label') }}: {{ model.end_time }}
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { locale, t } = useI18n()
const {
  formatDateStr,
  formatTimeStr,
  formatTimeRangeStr
} = useDateFormatter()

interface EventDate {
  start_date: string | null
  start_time: string | null
  end_date: string | null
  end_time: string | null
  entry_time?: string | null
  all_day: boolean
}

interface Props {
  date: EventDate
}

const props = defineProps<Props>()

interface SingleDayModel {
  type: 'single'
  date: string
  time: string | null
  entry_time: string | null
}

interface MultiDayModel {
  type: 'multi'
  start_date: string
  start_time: string | null
  end_date: string | null
  end_time: string | null
  entry_time: string | null
}

type DisplayModel = SingleDayModel | MultiDayModel

const model = computed<DisplayModel>(() => {
  const date = props.date
  const sameDay = !date.end_date || date.end_date === date.start_date

  if (sameDay) {
    return {
      type: 'single',
      date: formatDateStr(date.start_date),
      time: formatTimeRangeStr(date.start_time, date.end_time),
      entry_time: date.entry_time ? formatTimeStr(date.entry_time) : null
    }
  }

  return {
    type: 'multi',
    start_date: formatDateStr(date.start_date),
    start_time: formatTimeStr(date.start_time),
    end_date: formatDateStr(date.end_date),
    end_time: date.end_time ? formatTimeStr(date.end_time) : null,
    entry_time: date.entry_time ? formatTimeStr(date.entry_time) : null
  }
})

const formatWeekday = (date: string | null) => {
  if (!date) {
    return ''
  }

  const [year, month, day] = date.split('-').map(Number)

  const weekday = new Intl.DateTimeFormat(locale.value, {
    weekday: 'short'
  }).format(
      new Date(year, month - 1, day)
  )
  return weekday
}
</script>
