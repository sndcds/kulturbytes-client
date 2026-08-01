<template>

  <!--pre>headData: {{ JSON.stringify(headData, null, 2) }}</pre-->
  <!--pre>seoData: {{ JSON.stringify(seoData, null, 2) }}</pre-->

  <!--pre>{{ JSON.stringify(event, null, 2)}}</pre-->

  <div
      v-if="event"
      class="kbts-event-view-layout"
  >
    <div class="kbts-event-view-layout-left">
      <!-- Image -->
      <div class="kbts-event-view-image">
        <div
            v-if="eventImage"
            class="kbts-event-view-image-outer"
        >
          <div
              class="kbts-event-view-image-inner"
              :class="{ 'has-placeholder': !eventImage }"
              :style="eventImage ? {
              backgroundImage: `url(${imageUrl(eventImage.url, 960, '16:9')})`
            } : {}"
          >
          </div>
        </div>

        <span v-if="imageCredit" class="kbts-event-view-image-caption">
        {{ imageCredit }}
      </span>
      </div>

      <div class="kbts-event-view-content">
        <ReleaseChip
            v-if="event.date.release_status != 'released'"
            :release-status="event.date.release_status"
            big
            style="margin-bottom: 1rem;"
        />

        <EventTypesDisplay
            v-if="event?.event_types"
            :event-types="event?.event_types ?? []"
            style="margin-bottom: .5rem;"
        />

        <TagList
            :tags="event.tags"
            style="margin-bottom: .5rem;"
        />

        <LanguageList
            :languages="event.languages"
            style="margin-bottom: .5rem;"
        />

        <h1 class="kbts-event-view-title">
          {{ event.title }}
        </h1>

        <h2 v-if="event.subtitle" class="kbts-event-view-subtitle">
          {{ event.subtitle }}
        </h2>

        <div
            class="kbts-event-description"
            v-html="descriptionHtml"
        />
      </div>

      <!-- Links -->
      <div
          v-if="event.event_links && event.event_links.length > 0 || event.source_link"
          class="kbts-event-view-links"
          style="margin-top: 3rem;"
      >
        <h3>Links</h3>
        <IconTextLink
            v-if="event.source_link"
            key="org-web-link"
            :url="localePath(ensureHttpOrHttps(event.source_link))"
            type="web"
            size="22px"
            class="kbts-event-view-link"
        />

        <IconTextLink
            v-for="(link, index) in event.event_links"
            :key="index"
            :url="localePath(ensureHttpOrHttps(link.url!))"
            :type="link.type"
            :label="link.label"
            size="22px"
            class="kbts-event-view-link"
        />
      </div>

      <div class="kbts-event-view-all-dates">
        <EventAllDatesList
            :dates="event.further_dates"
            :current-date="event.date"
        />
      </div>

    </div>

    <div class="kbts-event-view-layout-right">
      <!-- Date and time -->
      <EventDateTimeDisplay
          class="kbts-event-view-date"
          :date="event.date"
      />

      <!-- Venue -->

      <LogoImage
          v-if="event.logo_mode & 0x2 && venueLogos"
          class="kbts-event-view-venue-logo"
          :main-src="venueLogos.main_logo?.url"
          :light-src="venueLogos.light_theme_logo?.url"
          :dark-src="venueLogos.dark_theme_logo?.url"
          :theme="themeStore.theme"
          :link-url="event.date.venue_web_link"
          :pixel-count="240 * 80"
          :max-width="240"
          :max-height="120"
          link-target="_blank"
      />

      <div class="kbts-event-view-venue kbts-flex-col">
        <span class="kbts-event-view-label">{{ t('event.venue') }}</span>
        <span>{{ event.date.venue_name }}</span>
        <span v-if="event.date.venue_street || event.date.venue_house_number">
          {{ [event.date.venue_street, event.date.venue_house_number].filter(Boolean).join(' ') }}
        </span>
        <span v-if="event.date.venue_postal_code || event.date.venue_city">
          {{ [event.date.venue_postal_code, event.date.venue_city].filter(Boolean).join(' ') }}
        </span>

        <template v-if="event.date.space_name">
          <span class="kbts-event-view-label">{{ t('event.space') }}</span>
          <span>{{ event.date.space_name }}</span>
        </template>

        <template v-if="event.meeting_point">
          <span class="kbts-event-view-label">{{ t('event.meeting_point') }}</span>
          <span>{{ event.meeting_point }}</span>
        </template>
      </div>


      <!-- Organizer -->

      <LogoImage
          v-if="event.logo_mode & 0x1 && eventOrganizer?.logos"
          class="kbts-event-view-organizer-logo"
          :main-src="eventOrganizer.logos.main_logo?.url"
          :light-src="eventOrganizer.logos.light_theme_logo?.url"
          :dark-src="eventOrganizer.logos.dark_theme_logo?.url"
          :theme="themeStore.theme"
          :link-url="eventOrganizer?.webLink"
          :pixel-count="120 * 80"
          :max-width="240"
          :max-height="120"
          link-target="_blank"
      />

      <div
          v-if="eventOrganizer?.name"
          class="kbts-event-view-organizer"
       >
        <span class="kbts-event-view-label">
          {{ t('event.organizer') }}
        </span><br>
        <a
            v-if="eventOrganizer?.webLink"
            :href="eventOrganizer.webLink"
            target="_blank"
            rel="noopener noreferrer"
        >
          {{ eventOrganizer.name }} ↗
        </a>
        <span v-else>
          {{ eventOrganizer.name }}
        </span>
      </div>

      <div class="kbts-event-view-price">
        <div class="kbts-flex-col">
          <!-- Price -->
          <ActionIcon
              v-if="priceText"
              :label="priceText"
              :icon="Coins"
          />
          <ActionIcon
              v-if="event.ticket_link"
              :to="event.ticket_link"
              :label="t('event.ticket_link')"
              :icon="TicketsIcon"
          />
        </div>

        <!-- Ticket infos -->
        <Accordion
            v-if="showTicketFlags"
        >
          <template #icon><Info :size="18"/></template>
          <template #title>{{ t('event.ticket_info') }}</template>

          <ul class="kbts-event-view-tiny-list">
            <li
                v-for="flag in event.ticket_flags"
                :key="flag"
            >
              {{ t(`event.ticket_flags.${flag}`) }}
            </li>
          </ul>
        </Accordion>
      </div>

      <!-- Participation infos -->
      <div
          v-if="(event.max_attendees ?? 0) > 0 || ageText || !!event.participation_info"
          class="kbts-event-view-participation kbts-flex-col"
      >
        <span class="kbts-event-view-label">{{ t('event.participation_info') }}</span>
        <span v-if="(event.max_attendees ?? 0) > 0">{{ maxAttendeesText }}</span>
        <span v-if="ageText">{{ ageText }}</span>
        <span v-if="event.participation_info">{{ event.participation_info }}</span>
      </div>

      <!-- Online Event -->
      <div
          v-if="event.online_link"
          class="kbts-event-view-online">
        <ActionIcon
            :to="ensureHttpOrHttps(event.online_link)"
            :label="t('event.to_online_event')"
            :icon="Video"
            style="padding-left: 0;"
        />
      </div>

      <!-- Registration -->
      <div
          v-if="event.registration_link || event.registration_email || event.registration_phone"
          class="kbts-event-view-registration kbts-flex-col"
      >
        <span class="kbts-event-view-label">{{ t('event.registration.label') }}</span>

        <ActionIcon
            v-if="event.registration_link"
            :to="ensureHttpOrHttps(event.registration_link)"
            :label="t('event.registration.link')"
            :icon="Link"
            style="padding-left: 0;"
        />

        <ActionIcon
            v-if="event.registration_email"
            :to="'mailto:' + event.registration_email"
            :label="t('event.registration.email')"
            :icon="Mail"
            style="padding-left: 0;"
        />

        <ActionIcon
            v-if="event.registration_phone"
            :label="event.registration_phone"
            :icon="Phone"
        />

        <ActionIcon
            v-if="event.registration_deadline"
            :label="registrationDeadline"
            :icon="Info"
        />
      </div>

      <!-- Accessibility -->
      <Accordion
          v-if="event.date.accessibility_labels?.length"
          class="kbts-event-view-accessibility"
      >
        <template #icon><Accessibility :size="18"/></template>

        <template #title>
          {{ t('accessibility.title') }}
          ({{ event.date.accessibility_labels.length }})
        </template>

        <ul class="kbts-event-view-tiny-list">
          <li
              v-for="label in event.date.accessibility_labels"
              :key="label"
          >
            {{ label }}
          </li>
        </ul>
      </Accordion>

      <div class="kbts-event-view-share">
        <div class="kbts-flex-col">
        <ActionIcon
            v-if="event.uuid"
            :label="t('download_ics')"
            :icon="CalendarArrowDown"
            @click="onDownloadIcs"
        />
        <ActionIcon
            v-if="event.uuid"
            :label="t('copy_link')"
            :icon="CopySlash"
            @click="onCopyLink"
        />
        </div>

        <FacebookShareButton
            :quote="event.title"
            hashtag="#kulturbytes"
            style="margin-top: .5rem;"
        />
      </div>

      <SinglePointMap
          v-if="Number.isFinite(event.date.venue_lat) && Number.isFinite(event.date.venue_lon)"
          class="kbts-event-view-map"
          :lat="Number(event.date.venue_lat)"
          :lon="Number(event.date.venue_lon)"
          :name="event.date.venue_name"
          :zoom="15"
          height="400px"
      />


    </div>

    <!--pre>{{ event }}</pre--->

    <!--p v-if="error">Error loading event</p-->
  </div>

</template>

<script setup lang="ts">
import { imageUrl } from '~/utils/image'
import { formatPrice } from '~/utils/formatPrice'
import SinglePointMap from '~/components/map/SinglePointMap.client.vue'
import ActionIcon from '~/components/ui/ActionIcon.vue'
import type { EventDate, EventItem, EventResponse } from '~/types/eventItem'
import EventAllDatesList from '~/components/event/EventAllDatesList.vue'
import IconTextLink from '~/components/ui/IconTextLink.vue'
import Accordion from '~/components/ui/Accordion.vue'
import ReleaseChip from '~/components/event/ui/ReleaseChip.vue'
import TagList from '~/components/ui/TagList.vue'
import LanguageList from '~/components/ui/LanguageList.vue'
import FacebookShareButton from '~/components/ui/FacebookShareButton.vue'
import LogoImage  from '~/components/ui/LogoImage.vue'
import {
  Info,
  CalendarArrowDown,
  CopySlash,
  TicketsIcon,
  Accessibility,
  Video,
  Phone,
  Mail,
  Link,
  Coins
} from '@lucide/vue'
import { useThemeStore } from "~/stores/themeStore";

defineI18nRoute({
  paths: {
    de: '/veranstaltung/[event_uuid]/[date_identifier]',
    da: '/begivenhed/[event_uuid]/[date_identifier]',
    en: '/event/[event_uuid]/[date_identifier]'
  }
})

const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()
const themeStore = useThemeStore()

const { renderMarkdown } = useMarkdown()
const { isDownloadingIcs, downloadIcs } = useIcsDownload()

const eventUuid = route.params.event_uuid as string
const dateIdentifier = route.params.date_identifier as string

const displayedTicketFlags = [
  'advance_ticket',
  'presale_fee_applies',
  'on_site_ticket_sales',
  'reduced_price_available',
  'registration_required',
]


const imageCredit = computed(() => {
  const image = event.value?.images?.main

  if (!image) {
    return null
  }

  const creditParts: string[] = []

  if (image.creator) {
    creditParts.push(image.creator)
  }

  if (image.copyright) {
    creditParts.push(`© ${image.copyright}`)
  }

  if (image.license_name) {
    creditParts.push(image.license_name)
  }

  if (!creditParts.length) {
    return null
  }

  return `${t('event.image_by')}: ${creditParts.join(', ')}`
})

const venueLogos = computed(() => {
  return event.value?.date?.venue_logos
})


const visibleTicketFlags = computed(() =>
    (event.value?.ticket_flags ?? []).filter(flag =>
        displayedTicketFlags.includes(flag)
    )
)

const ageText = computed(() => {
  const minAge = event.value?.min_age
  const maxAge = event.value?.max_age

  if (minAge == null && maxAge == null) {
    return null
  }

  if (minAge != null && maxAge != null) {
    return t('event.age_range', {
      min_age: minAge,
      max_age: maxAge,
    })
  }

  if (minAge != null) {
    return t('event.age_from', {
      age: minAge,
    })
  }

  return t('event.age_until', {
    age: maxAge,
  })
})

const maxAttendeesText = computed(() => {
  return t('event.max_attendees', {
    count: event.value?.max_attendees
  })
})

const registrationDeadline = computed(() => {
  if (!event.value?.registration_deadline) return "";

  return `${t("event.registration.deadline")} ${formatDate(
      locale.value,
      event.value.registration_deadline
  )}`;
});


const { $api } = useNuxtApp()

async function fetchEvent() {
  return $api<EventResponse>(
      `/api/event/${eventUuid}/date/${dateIdentifier}`,
      {
        query: {
          lang: locale.value,
        },
      }
  )
}

/*
const { data: eventResponse, error } = await useAsyncData(
    `event-${eventUuid}-${dateIdentifier}-${locale.value}`,
    fetchEvent
)
*/

const { data: eventResponse, error } = await useAsyncData(
    `event-${eventUuid}-${dateIdentifier}`,
    fetchEvent
)

const event = computed(() => eventResponse.value?.data)
const eventImage = computed(() => event.value?.images?.main)
const descriptionHtml = computed(() =>
    event.value?.description
        ? renderMarkdown(event.value.description)
        : ''
)

const eventOrganizer = computed(() => {
  if (!event.value) return null
  return {
    name: event.value.org_name,
    webLink: event.value.org_web_link,
    logos: event.value.org_logos,
  }
})

const priceText = computed(() => {
  if (!event.value) return null

  if (event.value.price_type == 'free') {
    return t('event.price_free')
  }
  if (event.value.price_type == 'donation') {
    return t('event.price_donation')
  }
  return formatPrice(t, locale.value, event.value?.min_price, event.value?.max_price, event.value?.currency ?? '')
})

const showTicketFlags = computed(() => {
  if (!event.value) {
    return false
  }
  return (
      event.value.ticket_flags?.length > 0 &&
      !['free', 'donation'].includes(event.value.price_type)
  )
})

const eventSchema = computed(() => {
  if (!event.value) return null

  const e = event.value
  const d = e.date

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',

    name: e.title,

    description: e.summary || e.description,

    image: e.images?.main?.url
        ? [imageUrl(e.images.main.url, 1200, '16:9')]
        : undefined,

    startDate: `${d.start_date}T${d.start_time || '00:00'}`,

    endDate: d.end_date
        ? `${d.end_date}T${d.end_time || '23:59'}`
        : undefined,

    doorTime: d.entry_time
        ? `${d.start_date}T${d.entry_time}`
        : undefined,

    eventStatus: 'https://schema.org/EventScheduled',

    location: {
      '@type': 'Place',
      name: d.venue_name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: [
          d.venue_street,
          d.venue_house_number
        ]
            .filter(Boolean)
            .join(' '),

        postalCode: d.venue_postal_code,
        addressLocality: d.venue_city,
        addressCountry: d.venue_country
      }
    },

    organizer: e.org_name
        ? {
          '@type': 'Organization',
          name: e.org_name,
          url: e.org_web_link
        }
        : undefined,

    url: `https://kulturbytes.de/event/${e.uuid}/${d.slug}`
  }

  // TODO: add price_type: and offers:
})

const headData = computed(() => ({
  script: eventSchema.value
      ? [
        {
          type: 'application/ld+json',
          children: JSON.stringify(eventSchema.value)
        }
      ]
      : []
}))

useHead(() => headData.value)

useSeoMeta({
    title: event.value.title,
    description: event.value.summary || event.value.description,

    ogTitle: event.value.title,
    ogDescription: event.value.summary || event.value.description,
    ogType:'article',
    ogImage:
        event.value.images?.main?.url
            ? imageUrl(
                event.value.images.main.url,
                1200,
                '16:9'
            )
            : undefined,

    twitterCard:'summary_large_image',
    twitterTitle: event.value.title,
    twitterDescription: event.value.summary || event.value.description,
    twitterImage:
        event.value.images?.main?.url
            ? imageUrl(
                event.value.images.main.url,
                1200,
                '16:9'
            )
            : undefined,

    robots:'index,follow'
})



const onDownloadIcs = () => {
  if (!event.value?.uuid || !event.value?.date?.uuid) {
    return
  }

  downloadIcs({
    eventUuid: event.value.uuid,
    eventDateUuid: event.value.date.uuid,
    title: event.value.title ?? '',
    locale: locale.value,
  })
}

const copied = ref(false)

const onCopyLink = async () => {
  const url = window.location.href
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true

    // Optional: reset after 2s
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    // console.error('Copy failed', err)
  }
}
</script>


<style lang="scss">
.kbts-event-view-content {
  grid-area: content;
}

.kbts-event-view-meta {
  grid-area: meta;
}

.kbts-event-view-all-dates {
  grid-area: all-dates;
}

.kbts-event-description {
  grid-area: description;

  // Lists
  ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
    list-style: none;
  }

  li {
    position: relative;
    margin-bottom: .5rem;
    padding-left: .75rem;
    color: var(--kbts-fg);
    line-height: 1.5;

    &::before {
      content: "";
      position: absolute;
      left: -0.4rem;
      top: 0.65em;
      width: .35rem;
      height: .35rem;
      border-radius: 50%;
      background: var(--kbts-fg);
    }
  }

  ul li p {
    margin: 0;
  }

  // Nested lists
  ul ul {
    margin-top: .5rem;
  }

  // Ordered lists
  ol {
    margin: 1rem 0;
    padding-left: 2rem;
  }

  ol li {
    padding-left: .25rem;
  }
}

.kbts-event-view-date {
  grid-area: info;
}

.kbts-event-view-image {
  grid-area: image;

  .kbts-event-view-image-outer {
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 8px;

    .kbts-event-view-image-inner {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;

      transition: transform 0.2s ease;

      &.has-placeholder {
        background: palegreen;
        color: white;
      }
    }
  }
}
</style>