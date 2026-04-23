<template>
  <div class="light-card">
    <h3>Ampel</h3>
    <div class="light-container">
      <div class="light red" :class="{ active: isRed }"></div>
      <div class="light yellow" :class="{ active: isYellow }"></div>
      <div class="light green" :class="{ active: isGreen }"></div>
    </div>
    <div class="status">{{ statusText }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { trafficLight } from '../services/opcuaClient'

// 0=Grün, 1=Gelb, 2=Rot, 3=Rot+Gelb
const isGreen = computed(() => trafficLight.value === 0)
const isYellow = computed(() => trafficLight.value === 1 || trafficLight.value === 3)
const isRed = computed(() => trafficLight.value === 2 || trafficLight.value === 3)

const statusText = computed(() => {
  switch (trafficLight.value) {
    case 0: return 'Grün - Freie Fahrt'
    case 1: return 'Gelb - Vorsicht'
    case 2: return 'Rot - Halt'
    case 3: return 'Rot + Gelb - Gleich Grün'
    default: return 'Unbekannt'
  }
})
</script>

<style scoped>
.light-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  text-align: center;
}
h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
}
.light-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: #2c3e50;
  padding: 24px;
  border-radius: 24px;
  width: 120px;
  margin: 0 auto;
}
.light {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #444;
  transition: all 0.3s ease;
  border: 3px solid #555;
}
.light.red.active {
  background: #e74c3c;
  border-color: #c0392b;
  box-shadow: 0 0 30px #e74c3c, inset 0 0 10px rgba(255,255,255,0.3);
}
.light.yellow.active {
  background: #f1c40f;
  border-color: #d4ac0d;
  box-shadow: 0 0 30px #f1c40f, inset 0 0 10px rgba(255,255,255,0.3);
}
.light.green.active {
  background: #2ecc71;
  border-color: #27ae60;
  box-shadow: 0 0 30px #2ecc71, inset 0 0 10px rgba(255,255,255,0.3);
}
.status {
  margin-top: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #555;
  min-height: 24px;
}
</style>
