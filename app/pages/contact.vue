<template>
  <article class="contact-page">
    <header>
      <h1>{{ t('contact.title') }}</h1>
      <p>{{ t('contact.intro') }}</p>
    </header>

    <form class="contact-form" @submit.prevent="submitContactForm">
      <div class="form-field">
        <label for="contact-email">{{ t('contact.email') }}</label>
        <input
          id="contact-email"
          v-model.trim="form.email"
          name="email"
          type="email"
          autocomplete="email"
          required
        >
      </div>

      <div class="form-field">
        <label for="contact-message">{{ t('contact.message') }}</label>
        <textarea
          id="contact-message"
          v-model.trim="form.message"
          name="message"
          rows="8"
          required
        />
      </div>

      <div class="contact-honeypot" aria-hidden="true">
        <label for="contact-website">Website</label>
        <input
          id="contact-website"
          v-model="form.website"
          name="website"
          type="text"
          autocomplete="off"
          tabindex="-1"
        >
      </div>

      <button class="kbts-button" type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? t('contact.sending') : t('contact.submit') }}
      </button>

      <p
        v-if="notification"
        class="notification"
        :class="`notification--${notification.type}`"
        :role="notification.type === 'error' ? 'alert' : 'status'"
        aria-live="polite"
      >
        {{ notification.message }}
      </p>
    </form>
  </article>
</template>

<script setup lang="ts">
type Notification = {
  type: 'success' | 'error'
  message: string
}

const { t } = useI18n()
const { $api } = useNuxtApp()

const form = reactive({
  email: '',
  message: '',
  website: ''
})
const isSubmitting = ref(false)
const notification = ref<Notification | null>(null)

definePageMeta({
  layout: 'default'
})

useHead({
  title: computed(() => t('contact.title'))
})

function getStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined

  const fetchError = error as {
    status?: number
    statusCode?: number
    response?: { status?: number }
  }

  return fetchError.statusCode ?? fetchError.status ?? fetchError.response?.status
}

async function submitContactForm() {
  if (isSubmitting.value) return

  notification.value = null
  isSubmitting.value = true

  try {
    await $api('/api/contact', {
      method: 'POST',
      body: {
        email: form.email,
        message: form.message,
        website: form.website
      }
    })

    form.email = ''
    form.message = ''
    form.website = ''
    notification.value = {
      type: 'success',
      message: t('contact.success')
    }
  } catch (error: unknown) {
    notification.value = {
      type: 'error',
      message: getStatusCode(error) === 429
        ? t('contact.rate_limit_error')
        : t('contact.generic_error')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.contact-page {
  width: min(100%, 720px);
  margin: 0 auto;

  h1 {
    margin: 0;
    font-size: 3rem;
    font-weight: 400;
  }

  header p {
    margin: 1rem 0 0;
    line-height: 1.6;
  }
}

.contact-form {
  margin-top: 2rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: var(--kbts-card-bg);
  border-radius: .5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: .4rem;

  label {
    font-weight: 600;
  }

  input,
  textarea {
    box-sizing: border-box;
    width: 100%;
    padding: .7rem .8rem;
    border: 1px solid var(--kbts-input-border);
    border-radius: .35rem;
    background: var(--kbts-bg);
    color: var(--kbts-fg);
    font: inherit;
  }

  textarea {
    resize: vertical;
  }

  input:focus-visible,
  textarea:focus-visible {
    outline: 2px solid var(--kbts-hover-fg);
    outline-offset: 2px;
  }
}

.contact-honeypot {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.kbts-button:disabled {
  cursor: wait;
  opacity: .65;
}

.notification {
  margin: 0;
  padding: .8rem 1rem;
  border: 1px solid;
  border-radius: .35rem;

  &--success {
    border-color: #238636;
    background: #eaf7ed;
    color: #145523;
  }

  &--error {
    border-color: #c62828;
    background: #fdecec;
    color: #8e1b1b;
  }
}

@media (max-width: 600px) {
  .contact-page h1 {
    font-size: 2.4rem;
  }

  .contact-form {
    padding: 1rem;
  }
}
</style>
