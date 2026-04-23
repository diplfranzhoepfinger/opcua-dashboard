<template>
  <div class="bar-card">
    <h3>Position</h3>
    <div class="bar-wrapper">
      <div class="bar-background">
        <div class="bar-fill" :style="{ width: percentage + '%' }"></div>
      </div>
      <div class="bar-labels">
        <span>0</span>
        <span>500</span>
        <span>1000 mm</span>
      </div>
    </div>
    <div class="value">{{ displayPosition }} mm</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { position } from '../services/opcuaClient'

const displayPosition = computed(() => position.value.toFixed(2))

const percentage = computed(() => {
  return Math.max(0, Math.min(100, (position.value / 1000) * 100))
})
</script>

<style scoped>
.bar-card {
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
.bar-wrapper {
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}
.bar-background {
  width: 100%;
  height: 36px;
  background: #e8e8e8;
  border-radius: 18px;
  overflow: hidden;
  position: relative;
}
.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71, #f1c40f, #e74c3c);
  border-radius: 18px;
  transition: width 0.1s linear;
}
.bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
  margin-top: 8px;
  padding: 0 4px;
}
.value {
  font-size: 32px;
  font-weight: bold;
  margin-top: 20px;
  color: #333;
}
</style>
