// src/composables/useAuth.js
import { reactive, computed } from 'vue'

const LS_USERS   = 'demo_users'      // { [email]: { passHash, name, createdAt } }
const LS_SESSION = 'demo_session'    // { email, name }

const state = reactive({
  user: JSON.parse(localStorage.getItem(LS_SESSION) || 'null')
})

const isAuthed = computed(() => !!state.user)

function _loadUsers()  { return JSON.parse(localStorage.getItem(LS_USERS) || '{}') }
function _saveUsers(u) { localStorage.setItem(LS_USERS, JSON.stringify(u)) }

// (tiny helper) SHA-256 hash in the browser so we don’t store raw passwords
async function hash(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('')
}

export async function signup(email, password, name){
  email = String(email||'').trim().toLowerCase()
  name  = String(name||'').trim()
  if (!email || !password || !name) throw new Error('Please fill all fields.')

  const users = _loadUsers()
  if (users[email]) throw new Error('Account already exists.')

  const passHash = await hash(password)
  users[email] = { passHash, name, createdAt: Date.now() }
  _saveUsers(users)

  state.user = { email, name }
  localStorage.setItem(LS_SESSION, JSON.stringify(state.user))
  return state.user
}

export async function login(email, password){
  email = String(email||'').trim().toLowerCase()
  const users = _loadUsers()
  const u = users[email]
  if (!u) throw new Error('Invalid credentials.')
  const passHash = await hash(password)
  if (u.passHash !== passHash) throw new Error('Invalid credentials.')

  state.user = { email, name: u.name }
  localStorage.setItem(LS_SESSION, JSON.stringify(state.user))
  return state.user
}

export function logout(){
  state.user = null
  localStorage.removeItem(LS_SESSION)
}

export function useAuth(){
  return { state, isAuthed, signup, login, logout }
}
