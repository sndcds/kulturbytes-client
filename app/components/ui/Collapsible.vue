<!-- components/ui/Collapsible.vue -->

<script setup lang="ts">
const open = defineModel<boolean>({
  default: false,
})

function toggle() {
  open.value = !open.value
}

function enter(el: Element) {
  const element = el as HTMLElement

  element.style.height = "0px"
  element.style.opacity = "0"

  requestAnimationFrame(() => {
    element.style.height = `${element.scrollHeight}px`
    element.style.opacity = "1"
  })

  element.addEventListener(
      "transitionend",
      () => {
        element.style.height = "auto"
      },
      { once: true }
  )
}

function leave(el: Element) {
  const element = el as HTMLElement

  // Start from the current height
  element.style.height = `${element.scrollHeight}px`
  element.style.opacity = "1"

  // Force a reflow so the browser registers the starting height
  void element.offsetHeight

  requestAnimationFrame(() => {
    element.style.height = "0px"
    element.style.opacity = "0"
  })
}
</script>

<template>
  <div class="collapsible-body">
    <button
        class="collapsible-header"
        type="button"
        :aria-expanded="open"
        @click="toggle"
    >
      <span class="collapsible-icon">
        <span
            class="vertical"
            :class="{ hidden: open }"
        />
        <span
            class="horizontal"
            :class="{ shifted: open }"
        />
      </span>

      <span class="kbts-collapsible-title">
        <slot name="title" />
      </span>
    </button>

    <Transition
        @enter="enter"
        @leave="leave"
    >
      <div
          v-show="open"
          class="collapsible-content"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.collapsible-body {
  padding-left: 0;
}

.collapsible-content {
  overflow: visible;
  transition:
      height 0.3s ease,
      opacity 0.3s ease;
}

.collapsible-header {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem 0;
  background: transparent;
  border: 0;
  cursor: pointer;
  text-align: left;
  font: inherit;
}

.kbts-collapsible-title {
  flex: 1;
  font-size: 1rem;
  font-weight: 500;
}

.collapsible-icon {
  position: relative;
  width: 12px;
  height: 12px;
  margin-right: 8px;
  flex-shrink: 0;
}

.collapsible-icon .horizontal,
.collapsible-icon .vertical {
  position: absolute;
  top: 50%;
  left: 50%;
  background-color: var(--kbts-fg);
  transition: all 0.3s ease;
}

.collapsible-icon .horizontal {
  width: 100%;
  height: 2px;
  transform: translate(-50%, -50%);
}

.collapsible-icon .vertical {
  width: 2px;
  height: 100%;
  transform: translate(-50%, -50%);
}

.collapsible-icon .vertical.hidden {
  opacity: 0;
  transform: translate(-50%, -50%) scaleY(0);
}

.collapsible-icon .horizontal.shifted {
  transform: translate(-50%, -50%);
}
</style>