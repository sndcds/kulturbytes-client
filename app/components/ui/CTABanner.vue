<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()
</script>

<template>
  <section class="home-intro">
    <div class="home-intro__image">
      <img
          src="/images/home/intro.webp"
          alt=""
      >
    </div>

    <div class="home-intro__content">
      <div class="home-intro__text">
        <h1>
          {{ t('home.intro.title') }}
        </h1>

        <p>
          {{ t('home.intro.description') }}
        </p>
      </div>

      <nav class="home-intro__actions" aria-label="Weitere Informationen">
        <NuxtLink
            :to="localePath('contact')"
            class="home-intro__action"
        >
          <span class="home-intro__action-label">
            {{ t('home.intro.contact') }}
          </span>

          <span class="home-intro__arrow" aria-hidden="true">
            <span class="home-intro__arrow-line" />
            <span class="home-intro__arrow-head" />
          </span>
        </NuxtLink>

        <NuxtLink
            :to="{
            path: localePath('contact'),
            hash: '#support-kulturbytes'
          }"
            class="home-intro__action"
        >
          <span class="home-intro__action-label">
            {{ t('home.intro.support') }}
          </span>

          <span class="home-intro__arrow" aria-hidden="true">
            <span class="home-intro__arrow-line" />
            <span class="home-intro__arrow-head" />
          </span>
        </NuxtLink>

        <NuxtLink
            :to="localePath('contact')"
            class="home-intro__action"
        >
          <span class="home-intro__action-label">
            {{ t('home.intro.organize') }}
          </span>

          <span class="home-intro__arrow" aria-hidden="true">
            <span class="home-intro__arrow-line" />
            <span class="home-intro__arrow-head" />
          </span>
        </NuxtLink>
      </nav>
    </div>
  </section>
</template>

<style scoped lang="scss">
.home-intro {
  display: grid;
  grid-template-columns: 40% 60%;
  min-height: 32rem;
  margin-bottom: 3rem;
  overflow: hidden;

  &__image {
    min-height: 100%;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    padding: 2.5rem 3rem 1.5rem;
  }

  &__text {
    max-width: 42rem;

    h1 {
      margin: 0 0 1.25rem;
    }

    p {
      margin: 0;
      max-width: 38rem;
      line-height: 1.6;
    }
  }

  &__actions {
    width: 100%;
    margin-top: 3rem;
  }

  &__action {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;

    min-height: 4rem;
    padding: 0.9rem 0;

    color: inherit;
    text-decoration: none;

    border-top: var(--kbts-card-border);

    &:last-child {
      border-bottom: var(--kbts-card-border);
    }

    &:hover {
      .home-intro__arrow {
        transform: translateX(0.5rem);
      }
    }

    &:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 4px;
    }
  }

  &__action-label {
    flex: 1;
  }

  &__arrow {
    display: flex;
    align-items: center;
    width: 4rem;
    flex-shrink: 0;

    transition: transform 180ms ease;
  }

  &__arrow-line {
    flex: 1;
    height: 1px;
    background: currentColor;
  }

  &__arrow-head {
    width: 0.55rem;
    height: 0.55rem;
    flex-shrink: 0;

    border-top: 1px solid currentColor;
    border-right: 1px solid currentColor;

    transform: rotate(45deg);
  }
}

@media (max-width: 700px) {
  .home-intro {
    grid-template-columns: 1fr;
    min-height: 0;

    &__image {
      aspect-ratio: 16 / 9;
      min-height: 0;
    }

    &__content {
      padding: 1.5rem 0 0;
    }

    &__actions {
      margin-top: 2.5rem;
    }

    &__action {
      min-height: 3.75rem;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-intro__arrow {
    transition: none;
  }
}
</style>