<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const { signup } = useAuth()
const router = useRouter()
const route = useRoute()

const name = ref('')
const email = ref('')
const password = ref('')
const err = ref('')
const pending = ref(false)

async function onSubmit(e) {
  e.preventDefault()
  err.value = ''

  // basic client-side checks (optional)
  if (!name.value.trim()) { err.value = 'Please enter your name.'; return }
  if (!email.value.trim()) { err.value = 'Please enter your email.'; return }
  if (password.value.length < 6) { err.value = 'Password must be at least 6 characters.'; return }

  pending.value = true
  try {
    await signup(email.value.trim(), password.value, name.value.trim())
    // go to redirect target if provided, else dashboard
    const redirectTo =
      typeof route.query.redirect === 'string' && route.query.redirect
        ? route.query.redirect
        : '/dashboard'
    router.replace(redirectTo)
  } catch (ex) {
    err.value = ex?.message || 'Sign up failed'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <!-- Full-screen centered layout (no navbar on auth pages) -->
  <section style="min-height:100vh;display:grid;place-items:center;padding:24px">
    <form class="card" style="width:min(480px,90vw);padding:24px" @submit="onSubmit">
      <h2 style="margin:0 0 8px">Create account</h2>

      <p v-if="err" style="color:#ff9a9a;margin:8px 0" aria-live="assertive">{{ err }}</p>

      <label>Name</label>
      <input
        class="input"
        v-model="name"
        required
        autocomplete="name"
        autofocus
      />

      <label style="margin-top:10px">Email</label>
      <input
        class="input"
        type="email"
        v-model="email"
        required
        autocomplete="email"
      />

      <label style="margin-top:10px">Password</label>
      <input
        class="input"
        type="password"
        v-model="password"
        required
        minlength="6"
        autocomplete="new-password"
      />

      <div style="margin-top:16px">
        <button
          type="submit"
          class="btn btn-white"
          style="width:100%"
          :disabled="pending"
        >
          <span v-if="!pending">Sign Up</span>
          <span v-else>Creating your account…</span>
        </button>
      </div>

      <div style="margin-top:10px;text-align:center;color:var(--muted)">
        Already have an account?
        <router-link to="/login">Log in</router-link>
      </div>
    </form>
  </section>
</template>
