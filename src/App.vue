<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const { state, isAuthed, logout } = useAuth()

function onLogout() {
  logout()
}
</script>

<template>
  <div>
    <!-- Hide navbar on Login/Signup pages -->
    <header
      v-if="!$route.meta.hideNav"
      :class="['topbar', { transparent: $route.name === 'home' }]"
    >
      <!-- Brand (left) -->
      <RouterLink to="/" class="brand">

        <img src="/nasa-logo.svg" alt="NASA" class="brand-logo" />
        <span class="brand-text">CLIO CLIMATE</span>
      </RouterLink>

      <!-- Links (right) -->
      <nav class="nav">
        <!-- If logged in -->
        <template v-if="isAuthed">
          <RouterLink to="/explore" class="nav-link">Explore</RouterLink>
          <RouterLink to="/dashboard" class="nav-link">Dashboard</RouterLink>
          <button class="nav-link btn btn-white" @click="onLogout">Logout</button>
        </template>

        <!-- If logged out -->
        <template v-else>
          <template v-if="$route.name === 'home'">
            <RouterLink to="/login" class="nav-link">Login</RouterLink>
            <RouterLink to="/signup" class="nav-link btn btn-white" style="padding:8px 14px">Sign Up</RouterLink>
          </template>

          <template v-else-if="$route.name === 'explore'">
            <RouterLink to="/login" class="nav-link">Login</RouterLink>
            <RouterLink to="/signup" class="nav-link btn btn-white" style="padding:8px 14px">Sign Up</RouterLink>
          </template>

          <template v-else-if="$route.name === 'dashboard'">
            <RouterLink to="/explore" class="nav-link">Explore</RouterLink>
          </template>

          <template v-else>
            <RouterLink to="/explore" class="nav-link">Explore</RouterLink>
            <RouterLink to="/login" class="nav-link">Login</RouterLink>
            <RouterLink to="/signup" class="nav-link btn btn-white" style="padding:8px 14px">Sign Up</RouterLink>
          </template>
        </template>
      </nav>
    </header>

    <RouterView />
  </div>
</template>

<style scoped>

/* Keep this minimal so it plays nicely with your theme.css */
.topbar{
  position: sticky;
  top: 0;
  z-index: 20;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  background: linear-gradient(180deg, rgba(7,23,63,.35), rgba(7,23,63,.08));
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255,255,255,.06);
}

/* Transparent ONLY on the Home route */
.topbar.transparent{
  background: transparent !important;
  backdrop-filter: none !important;
  border-bottom-color: transparent !important;
}

.brand{
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #eaf2ff;
  margin-right: auto; /* push links to the right */
}
.brand-logo{
  height: 42px;
  width: auto;
  display: block;
  opacity: .95;
}
.brand-text{
font-family: var(--font-brand);
  font-weight: 900;              /* heavy look */
  letter-spacing: 2px;
  font-size: 18px;               /* adjust as you like */
  line-height: 1;
  color: #fff;
  text-transform: uppercase; 
}

/* Right-aligned nav (your theme.css already styles .nav-link & .btn-white) */
.nav{
  display: flex;
  gap: 12px;
  margin-left: auto;
}
</style>
