// src/composables/useAuth.js
import { reactive, computed } from 'vue'

const API = import.meta.env.VITE_API_BASE || ''

// local fallback keys
const LS_USERS    = 'demo_users'     // { [email]: { password, name } }
const LS_SESSION  = 'demo_session'   // { email, name }
const TOKEN_KEY   = 'auth_token'     // JWT when backend works

const state = reactive({
  user:  JSON.parse(localStorage.getItem(LS_SESSION) || 'null'),
  token: localStorage.getItem(TOKEN_KEY) || null,
})

const isAuthed = computed(() => !!state.user)

function setSession(user, token = null) {
  state.user = user
  localStorage.setItem(LS_SESSION, JSON.stringify(user))
  if (token) {
    state.token = token
    localStorage.setItem(TOKEN_KEY, token)
  }
}

async function login(email, password) {
  // Try backend first
  if (API) {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        const json = await res.json()
        setSession(json.user || { email }, json.token)
        return state.user
      }
    } catch (e) {
      console.warn('login: backend unavailable, falling back to local', e)
    }
  }
  // Fallback: LocalStorage
  const users = JSON.parse(localStorage.getItem(LS_USERS) || '{}')
  if (!users[email] || users[email].password !== password) {
    throw new Error('Invalid credentials.')
  }
  setSession({ email, name: users[email].name || '' })
  return state.user
}

async function signup(email, password, name) {
  // Try backend first
  if (API) {
    try {
      const res = await fetch(`${API}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      if (res.ok) {
        const json = await res.json()
        setSession(json.user || { email, name }, json.token)
        return state.user
      }
    } catch (e) {
      console.warn('signup: backend unavailable, using local fallback', e)
    }
  }
  // Fallback: LocalStorage
  const users = JSON.parse(localStorage.getItem(LS_USERS) || '{}')
  if (users[email]) throw new Error('Account already exists.')
  users[email] = { password, name }
  localStorage.setItem(LS_USERS, JSON.stringify(users))
  setSession({ email, name })
  return state.user
}

function logout() {
  state.user = null
  state.token = null
  localStorage.removeItem(LS_SESSION)
  localStorage.removeItem(TOKEN_KEY)
}

/** Authenticated fetch (adds Authorization header if we have a token) */
async function authFetch(path, opts = {}) {
  const url = path.startsWith('http') ? path : `${API}${path}`
  const headers = { ...(opts.headers || {}) }
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`
  const res = await fetch(url, { ...opts, headers })
  if (res.status === 401) throw new Error('Unauthorized')
  return res
}

export function useAuth() {
  return { state, isAuthed, login, signup, logout, authFetch }
}
