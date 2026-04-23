<template>
  <div class="gauge-card">
    <h3>Temperatur</h3>
    <svg viewBox="0 0 200 130" class="gauge">
      <!-- Background arc -->
      <path
        d="M 20 110 A 80 80 0 0 1 180 110"
        fill="none"
        stroke="#e0e0e0"
        stroke-width="18"
        stroke-linecap="round"
      />
      <!-- Value arc -->
      <path
        :d="arcPath"
        fill="none"
        :stroke="arcColor"
        stroke-width="18"
        stroke-linecap="round"
      />
      <!-- Ticks -->
      <text x="20" y="125" text-anchor="middle" class="tick">20</text>
      <text x="100" y="20" text-anchor="middle" class="tick">50</text>
      <text x="180" y="125" text-anchor="middle" class="tick">80</text>
      <!-- Value -->
      <text x="100" y="100" text-anchor="middle" class="value">{{ displayTemp }}°C</text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { temperature } from '../services/opcuaClient'

const MIN_TEMP = 20
const MAX_TEMP = 80

const displayTemp = computed(() => temperature.value.toFixed(1))

const percentage = computed(() => {
  return Math.max(0, Math.min(1, (temperature.value - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)))
})

const arcPath = computed(() => {
  const angle = percentage.value * 180
  const rad = (angle * Math.PI) / 180
  const x = 100 - 80 * Math.cos(rad)
  const y = 110 - 80 * Math.sin(rad)
  return `M 20 110 A 80 80 0 0 1 ${x} ${y}`
})

const arcColor = computed(() => {
  const p = percentage.value
  if (p < 0.33) return '#3498db'
  if (p < 0.66) return '#2ecc71'
  if (p < 0.83) return '#f1c40f'
  return '#e74c3c'
})
</script>

<style scoped>
.gauge-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  text-align: center;
}
h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 18px;
}
.gauge {
  width: 200px;
  height: 130px;
  margin: 0 auto;
}
.tick {
  font-size: 12px;
  fill: #888;
}
.value {
  font-size: 26px;
  font-weight: bold;
  fill: #333;
}
</style>
