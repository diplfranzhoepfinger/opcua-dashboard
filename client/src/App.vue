<template>
  <div class="app">
    <header>
      <h1>OPC UA Dashboard</h1>
      <div class="status" :class="statusClass">{{ connectionStatus }}</div>
    </header>
    <main class="dashboard">
      <TemperatureGauge />
      <PositionBar />
      <TrafficLight />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import TemperatureGauge from './components/TemperatureGauge.vue'
import PositionBar from './components/PositionBar.vue'
import TrafficLight from './components/TrafficLight.vue'
import { connectionStatus, connectOpcua } from './services/opcuaClient'

const statusClass = computed(() => {
  if (connectionStatus.value === 'Connected') return 'connected'
  if (connectionStatus.value.startsWith('Error')) return 'error'
  return 'disconnected'
})

onMounted(() => {
  connectOpcua()
})
</script>

<style>
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f5f6fa;
  color: #333;
}
</style>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #ddd;
}
h1 {
  margin: 0;
  font-size: 28px;
  color: #2c3e50;
}
.status {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
  background: #95a5a6;
  color: white;
  transition: background 0.3s;
}
.status.connected { background: #2ecc71; }
.status.disconnected { background: #e74c3c; }
.status.error { background: #e67e22; }
.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}
</style>
