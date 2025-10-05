<script setup>
const props = defineProps({
  name: { type: String, required: true },   // sun | cloud | cloud-rain | wind | snow | droplet | thermometer | uv
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: '#eaf2ff' },
  opacity: { type: Number, default: 0.95 }
})
</script>

<template>
  <svg
    v-if="name==='sun'"
    :width="size" :height="size" viewBox="0 0 24 24" fill="none"
    :style="{opacity}"
    xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="5.5" :stroke="color" stroke-width="1.75"/>
    <g :stroke="color" stroke-width="1.6" stroke-linecap="round">
      <path d="M12 2.5v2.5M12 19v2.5M4.5 12H2M22 12h-2.5M5 5l1.8 1.8M17.2 17.2 19 19M5 19l1.8-1.8M17.2 6.8 19 5"/>
    </g>
  </svg>

  <svg
    v-else-if="name==='cloud'"
    :width="size" :height="size" viewBox="0 0 24 24" fill="none"
    :style="{opacity}" xmlns="http://www.w3.org/2000/svg">
    <path :stroke="color" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
      d="M7.5 18.5h9a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1.8A3.8 3.8 0 0 0 7.5 18.5Z"/>
  </svg>

  <svg
    v-else-if="name==='cloud-rain'"
    :width="size" :height="size" viewBox="0 0 24 24" fill="none"
    :style="{opacity}" xmlns="http://www.w3.org/2000/svg">
    <path :stroke="color" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
      d="M7.5 16.5h9a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1.8A3.8 3.8 0 0 0 7.5 16.5Z"/>
    <path :stroke="color" stroke-width="1.6" stroke-linecap="round" d="M9 18.5v3M12 18.5v3M15 18.5v3"/>
  </svg>

  <svg
    v-else-if="name==='wind'"
    :width="size" :height="size" viewBox="0 0 24 24" fill="none"
    :style="{opacity}" xmlns="http://www.w3.org/2000/svg">
    <path :stroke="color" stroke-width="1.6" stroke-linecap="round"
      d="M3 9.5h10a2.5 2.5 0 1 0-2.4-3M3 13h13.5a2 2 0 1 1-1.9 2.6M3 16.5h7.5"/>
  </svg>

  <svg
    v-else-if="name==='snow'"
    :width="size" :height="size" viewBox="0 0 24 24" fill="none"
    :style="{opacity}" xmlns="http://www.w3.org/2000/svg">
    <g :stroke="color" stroke-width="1.5" stroke-linecap="round">
      <path d="M12 3v18M7 6.5l10 11M17 6.5l-10 11"/>
    </g>
  </svg>

  <svg
    v-else-if="name==='droplet'"
    :width="size" :height="size" viewBox="0 0 24 24" fill="none"
    :style="{opacity}" xmlns="http://www.w3.org/2000/svg">
    <path :stroke="color" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
      d="M12 3s6 6.2 6 10a6 6 0 1 1-12 0c0-3.8 6-10 6-10Z"/>
  </svg>

  <svg
    v-else-if="name==='thermometer'"
    :width="size" :height="size" viewBox="0 0 24 24" fill="none"
    :style="{opacity}" xmlns="http://www.w3.org/2000/svg">
    <path :stroke="color" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
      d="M14 13.5V6.8a2 2 0 1 0-4 0v6.7a4.5 4.5 0 1 0 4 0Z"/>
    <path :stroke="color" stroke-width="1.6" d="M10 14.5h4"/>
  </svg>

  <svg
    v-else  <!or default -->
    :width="size" :height="size" viewBox="0 0 24 24" fill="none"
    :style="{opacity}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="4.8" :stroke="color" stroke-width="1.6"/>
    <path :stroke="color" stroke-width="1.6" stroke-linecap="round"
      d="M6 12h12M12 6v12"/>
  </svg>
</template>
