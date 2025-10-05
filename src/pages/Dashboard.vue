<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { state, isAuthed, authFetch, refreshMe } = useAuth()

const loading = ref(true)
const errorMsg = ref('')
const items = ref([])

function parseMaybeJSON(v, fallback) {
  if (v == null) return fallback
  if (typeof v !== 'string') return v
  try { return JSON.parse(v) } catch { return fallback }
}

function mapRow(row) {
  // Backend might return JSON fields as strings or already-parsed
  const variables = parseMaybeJSON(row.variables || row.variables_json, [])
  const coords    = parseMaybeJSON(row.coordinates || row.coordinates_json, null)
  const thresholds= parseMaybeJSON(row.thresholds || row.thresholds_json, {})
  const analysis  = parseMaybeJSON(row.analysis || row.analysis_json, {})

  return {
    id: row.id,
    location: row.location_text || row.location || '(no location)',
    timeDesc: row.time_desc || row.timeDesc || '',
    variables,
    coordinates: coords,
    thresholds,
    analysisData: analysis,
    createdAt: row.created_at || row.createdAt || null,
    title: row.title || null,
  }
}

async function loadSaved() {
  loading.value = true
  errorMsg.value = ''
  try {
    // Ensure session is valid (useAuth tries this on import, this is just defensive)
    if (!isAuthed.value) {
      await refreshMe()
      if (!isAuthed.value) {
        router.replace({ name: 'login', query: { redirect: '/dashboard' } })
        return
      }
    }

    const res = await authFetch('/api/saved', { method: 'GET' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Failed to load saved items')
    const rows = Array.isArray(data.items || data) ? (data.items || data) : []
    items.value = rows.map(mapRow)
  } catch (e) {
    errorMsg.value = e.message || 'Failed to load saved items'
    items.value = []
  } finally {
    loading.value = false
  }
}

function openInExplore(it) {
  // Stash the full payload so Explore can pre-fill even before you update it to fetch by ID.
  // (Explore can read this with: JSON.parse(sessionStorage.getItem('stash_saved_open') || 'null'))
  sessionStorage.setItem('stash_saved_open', JSON.stringify(it))
  router.push({ name: 'explore', query: { load: String(it.id) } })
}

async function removeItem(id) {
  const snapshot = items.value.slice()
  items.value = items.value.filter(x => x.id !== id)  // optimistic UI update

  try {
    const res = await authFetch(`/api/saved/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Delete failed')
    }
  } catch (e) {
    // rollback on failure
    items.value = snapshot
    alert(e.message || 'Could not delete item')
  }
}

const countLabel = (it) => (it.variables?.length ? `${it.variables.length} variable${it.variables.length>1?'s':''}` : 'No variables')

const emptyMessage = computed(() =>
  isAuthed.value
    ? 'No saves yet. Go to Explore and save one.'
    : 'Please log in to see your saves.'
)

onMounted(loadSaved)
</script>

<template>
  <section style="max-width:1000px;margin:auto;padding:20px">
    <header style="display:flex;align-items:end;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div>
        <h2 style="margin:0 0 6px">Saved locations & times</h2>
        <p style="margin:0;color:var(--muted)">Your saved analyses from Explore</p>
      </div>
      <router-link class="btn" style="border:1px solid #2E96F5" to="/explore">+ New analysis</router-link>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="card" style="padding:16px;margin-top:12px">
      Loading your saves…
    </div>

    <!-- Error -->
    <div v-else-if="errorMsg" class="card" style="padding:16px;margin-top:12px;border-left:4px solid #E43700">
      {{ errorMsg }}
    </div>

    <!-- Empty -->
    <div v-else-if="!items.length" class="card" style="padding:16px;margin-top:12px">
      {{ emptyMessage }}
      <div style="margin-top:8px">
        <router-link class="btn btn-primary" to="/explore">Go to Explore</router-link>
      </div>
    </div>

    <!-- Grid of saves -->
    <div
      v-else
      style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:12px"
    >
      <div class="card" style="padding:14px;display:flex;flex-direction:column;gap:8px" v-for="it in items" :key="it.id">
        <div style="font-weight:800">{{ it.title || it.location }}</div>
        <div style="color:var(--muted);font-size:12px">{{ it.timeDesc || '—' }}</div>
        <div style="font-size:12px">
          <strong>Vars:</strong>
          <span style="color:var(--muted)">{{ countLabel(it) }}</span>
        </div>
        <div v-if="it.coordinates" style="font-size:12px;color:var(--muted)">
          {{ it.coordinates.lat?.toFixed?.(4) ?? it.coordinates.lat }}, {{ it.coordinates.lon?.toFixed?.(4) ?? it.coordinates.lon }}
        </div>
        <div v-if="it.createdAt" style="font-size:12px;color:var(--muted)">
          Saved: {{ new Date(it.createdAt).toLocaleString() }}
        </div>

        <div style="display:flex;gap:8px;margin-top:auto">
          <button class="btn btn-primary" @click="openInExplore(it)">Open in Explore</button>
          <button class="btn" @click="removeItem(it.id)">Delete</button>
        </div>
      </div>
    </div>
  </section>
</template>
