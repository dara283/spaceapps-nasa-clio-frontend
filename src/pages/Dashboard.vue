<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { getSaved, deleteItem } from '@/utils/saved'

const { state, isAuthed, authFetch } = useAuth()
const router = useRouter()
const items = ref([])
const loading = ref(false)
const errorMsg = ref('')

async function loadRemote() {
  // only try if we have a token and API configured
  try {
    const res = await authFetch('/api/saves', { method: 'GET' })
    if (!res.ok) throw new Error(`API ${res.status}`)
    const json = await res.json()
    items.value = Array.isArray(json.items) ? json.items : []
  } catch (e) {
    throw e
  }
}

function loadLocal() {
  if (!state.user?.email) {
    items.value = []
    return
  }
  items.value = getSaved(state.user.email)
}

async function refresh() {
  loading.value = true
  errorMsg.value = ''
  try {
    // try backend first (if token exists)
    if (state.token) {
      await loadRemote()
    } else {
      loadLocal()
    }
  } catch (e) {
    console.warn('Dashboard: falling back to local saves:', e.message)
    loadLocal()
  } finally {
    loading.value = false
  }
}

function open(it) {
  router.push({ name: 'explore', query: { load: it.id } })
}
function removeItem(id) {
  // local delete always works
  deleteItem(state.user.email, id)
  refresh()
}
function newAnalysis() {
  router.push('/explore')
}

onMounted(refresh)
</script>

<template>
  <section style="max-width:1000px;margin:auto;padding:20px">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
      <div>
        <h2>Saved locations & times</h2>
        <p style="color:var(--muted);margin-top:-6px">Your saved analyses from Explore</p>
      </div>
      <button class="btn btn-white" @click="newAnalysis">+ New analysis</button>
    </div>

    <div v-if="loading" class="card" style="padding:16px;margin-top:10px">
      Loading your saved items…
    </div>

    <div v-else-if="errorMsg" class="card" style="padding:16px;margin-top:10px;color:#ff9a9a">
      {{ errorMsg }}
    </div>

    <div v-else-if="!items.length" class="card" style="padding:16px;margin-top:10px">
      No saves yet. Go to <router-link to="/explore">Explore</router-link> and save one.
    </div>

    <div v-else style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:10px">
      <div class="card" style="padding:14px" v-for="it in items" :key="it.id">
        <div style="font-weight:800">{{ it.location }}</div>
        <div style="color:var(--muted);font-size:12px">{{ it.timeDesc }}</div>
        <div style="margin:6px 0;font-size:12px">Vars: {{ it.variables?.join(', ') }}</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary" @click="open(it)">Open in Explore</button>
          <button class="btn" @click="removeItem(it.id)">Delete</button>
        </div>
      </div>
    </div>
  </section>
</template>
