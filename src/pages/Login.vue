<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const email = ref('')
const password = ref('')
const err = ref('')

const router = useRouter()
const route = useRoute()
const { login } = useAuth()

async function onSubmit(e) {
  e.preventDefault()
  try {
    await login(email.value, password.value)
    // go to ?redirect=... or default to dashboard
    router.push(route.query.redirect || '/dashboard')
  } catch (ex) {
    err.value = ex?.message || 'Login failed'
  }
}
</script>

<template>
  <section style="min-height:100vh;display:grid;place-items:center;">
    <form class="card" style="width:min(440px,90vw);padding:24px" @submit="onSubmit">
      <h2 style="margin:0 0 8px">Welcome back</h2>
      <p v-if="err" style="color:#ff9a9a">{{ err }}</p>

      <label>Email</label>
      <input class="input" type="email" v-model="email" required />

      <label style="margin-top:10px">Password</label>
      <input class="input" type="password" v-model="password" required />

      <div style="margin-top:16px">
        <button type="submit" class="btn btn-white" style="width:100%">Login</button>
      </div>

      <div style="margin-top:10px;text-align:center;color:var(--muted)">
        Don’t have an account? <router-link to="/signup">Sign up</router-link>
      </div>
    </form>
  </section>
</template>
