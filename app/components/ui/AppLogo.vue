<script setup lang="ts">
interface Props {
  size?: number | string
  color?: string
}

withDefaults(defineProps<Props>(), {
  size: 30,
  color: '#333',
})
</script>

<template>
  <svg
      class="uranus-logo"
      :style="{
      width: typeof size === 'number' ? `${size}px` : size,
      color,
    }"
      viewBox="0 0 5363 5906"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
  >
    <g transform="matrix(8.99587e-16,14.6914,-14.6914,8.99587e-16,27639.5,-15266.9)">
      <g transform="matrix(0.707107,-0.707107,0.569028,0.569028,560.956,1441.61)">
        <path d="M410.608,983.158L169.362,983.158L169.362,697.076L227.359,697.076L227.359,911.087L410.608,911.087L410.608,983.158Z" style="fill:currentColor;"/>
      </g>
      <g transform="matrix(6.4554e-17,-1.05425,1.04984,6.42839e-17,90.9375,2774.81)">
        <path d="M1084.25,903.222C1144.69,903.222 1193.7,952.349 1193.7,1012.79C1193.7,1045.33 1179.5,1074.59 1156.95,1094.67C1179.5,1114.75 1193.7,1144.01 1193.7,1176.55C1193.7,1236.99 1144.69,1286.11 1084.25,1286.11L1084.25,1230.55C1114.09,1230.55 1138.37,1206.38 1138.37,1176.55C1138.37,1146.71 1114.09,1122.54 1084.25,1122.54L1084.25,1066.79C1114.09,1066.79 1138.37,1042.62 1138.37,1012.79C1138.37,982.951 1114.09,958.786 1084.25,958.786L1084.25,903.222Z" style="fill:currentColor;"/>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.uranus-logo {
  display: block;
  height: auto;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}
</style>