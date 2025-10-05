// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Explore from '@/pages/Explore.vue'
import Dashboard from '@/pages/Dashboard.vue'
import Login from '@/pages/Login.vue'
import Signup from '@/pages/Signup.vue'
import { useAuth } from '@/composables/useAuth'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/explore', name: 'explore', component: Explore },
  { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { auth: true } },
  { path: '/login', name: 'login', component: Login, meta: { hideNav: true } },
  { path: '/signup', name: 'signup', component: Signup, meta: { hideNav: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const { isAuthed } = useAuth()
router.beforeEach((to, _from, next) => {
  if (to.meta.auth && !isAuthed.value) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
