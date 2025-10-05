<script setup>
/*
  Props:
    - labels: Date[] | string[]
    - mean: number[]
    - title: string
    - yUnit: string
    - lineColor: string        // NEW
    - areaColor: string|null   // NEW (fill under line)
    - gridColor: string|null   // NEW
*/
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { Chart } from 'chart.js/auto'

const props = defineProps({
  labels: { type: Array, required: true },
  mean: { type: Array, required: true },
  title: { type: String, default: '' },
  yUnit: { type: String, default: '' },
  lineColor: { type: String, default: 'var(--blue-yonder, #2E96F5)' },
  areaColor: { type: String, default: null },
  gridColor: { type: String, default: null }
})

const canvas = ref(null)
let chart

function makeChart(){
  if (chart) chart.destroy()

  chart = new Chart(canvas.value, {
    type: 'line',
    data: {
      labels: props.labels.map(l => (l instanceof Date ? l.toLocaleDateString('en-US', { year:'numeric' }) : l)),
      datasets: [{
        label: props.title || 'Series',
        data: props.mean,
        borderColor: props.lineColor,
        backgroundColor: props.areaColor || props.lineColor + '33', // 20% alpha if not given
        fill: !!(props.areaColor || props.lineColor),
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed.y
              return `${props.title ? props.title + ': ' : ''}${v != null ? v.toFixed(1) : '—'}${props.yUnit ? ' ' + props.yUnit : ''}`
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: props.gridColor || 'rgba(255,255,255,.08)' },
          ticks: { color: '#c9d3e3' }
        },
        y: {
          grid: { color: props.gridColor || 'rgba(255,255,255,.08)' },
          ticks: {
            color: '#c9d3e3',
            callback: (v) => props.yUnit ? `${v} ${props.yUnit}` : v
          }
        }
      }
    }
  })
}

onMounted(makeChart)
onBeforeUnmount(() => chart && chart.destroy())

// Rebuild if data or colors change
watch(() => [props.labels, props.mean, props.lineColor, props.areaColor, props.gridColor], makeChart, { deep: true })
</script>

<template>
  <div style="height:280px">
    <canvas ref="canvas"></canvas>
  </div>
</template>
