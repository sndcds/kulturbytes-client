<template>
  <div v-if="geometry && groups.length" class="portal-geometries">
    <PortalGeometryMap
        v-for="group in groups"
        :key="`${geometry.uuid}:${group.type}`"
        :main-geometry="geometry"
        :child-type="group.type"
        :geometries="group.children"
        :model-value="filtersStore.eventPortalGeometryUuid"
        @update:model-value="filtersStore.setEventPortalGeometryUuid"
    />
  </div>
</template>

<script setup lang="ts">
import PortalGeometryMap from '~/components/portal/PortalGeometryMap.client.vue'
import { useFiltersStore } from '~/stores/filtersStore'
import type { PortalGeometry } from '~/types/portal'
import { groupPortalChildren } from '~/utils/portalGeometry'

const props = defineProps<{ geometry: PortalGeometry | null }>()
const filtersStore = useFiltersStore()
const groups = computed(() => groupPortalChildren(props.geometry))

watch(
    [groups, () => filtersStore.eventPortalGeometryUuid],
    ([groups, selectedUuid]) => {
      if (selectedUuid === null) return
      if (!groups.some(group => group.children.some(child => child.uuid === selectedUuid))) {
        filtersStore.setEventPortalGeometryUuid(null)
      }
    },
    { immediate: true }
)
</script>

<style scoped>
.portal-geometries {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  min-width: 0;
  order: 70;
}
</style>
