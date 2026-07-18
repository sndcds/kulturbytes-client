<template>
  <span
      v-if="releaseStatus && label"
      class="release-status-chip"
      :class="[
        releaseStatus,
        {
          tiny, big
        }
      ]"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">

type ReleaseStatus =
    | 'draft'
    | 'review'
    | 'released'
    | 'cancelled'
    | 'deferred'
    | 'rescheduled'


const props = withDefaults(
    defineProps<{
      releaseStatus?: ReleaseStatus | string | null
      tiny?: boolean
      big?: boolean
    }>(),
    {
      releaseStatus: null,
      tiny: false,
      big: false,
    }
)

const { t } = useI18n()


const label = computed(() => {
  if (!props.releaseStatus) {
    return ''
  }

  return t(`event.release_status.${props.releaseStatus}`)
})

</script>

<style scoped lang="scss">

.release-status-chip {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.24rem 0.7rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 1em;

  &.tiny {
    padding: 0.2rem 0.5rem;
    font-size: 0.76em;
  }

  &.big {
    padding: 0.4rem 1rem;
    font-size: 1.2em;
  }
}

.draft {
  color: var(--kbts-event-release-fg-draft);
  background: var(--kbts-event-release-bg-draft);
}

.review {
  color: var(--kbts-event-release-fg-review);
  background: var(--kbts-event-release-bg-review);
}

.released {
  color: var(--kbts-event-release-fg-released);
  background: var(--kbts-event-release-bg-released);
}

.cancelled {
  color: var(--kbts-event-release-fg-cancelled);
  background: var(--kbts-event-release-bg-cancelled);
}

.deferred {
  color: var(--kbts-event-release-fg-deferred);
  background: var(--kbts-event-release-bg-deferred);
}

.rescheduled {
  color: var(--kbts-event-release-fg-rescheduled);
  background: var(--kbts-event-release-bg-rescheduled);
}

</style>