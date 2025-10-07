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
          <!-- Hide the search icon when already on Explore -->
          <RouterLink
            v-if="$route.name !== 'explore'"
            to="/explore"
            class="nav-icon"
            aria-label="Search"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round"
                 stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </RouterLink>

          <RouterLink to="/dashboard" class="nav-link">Dashboard</RouterLink>
          <button class="nav-link btn btn-white" @click="onLogout">Log out</button>
        </template>

        <!-- If logged out -->
        <template v-else>
          <!-- HOME: (Search icon) + Login + Sign Up -->
          <template v-if="$route.name === 'home'">
            <RouterLink to="/explore" class="nav-icon" aria-label="Search">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round"
                   stroke-linejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </RouterLink>
            <RouterLink to="/login" class="nav-link">Log in</RouterLink>
            <RouterLink to="/signup" class="nav-link btn btn-white" style="padding:8px 14px">Sign up</RouterLink>
          </template>

          <!-- EXPLORE: Login + Sign Up (no search icon here) -->
          <template v-else-if="$route.name === 'explore'">
            <RouterLink to="/login" class="nav-link">Log in</RouterLink>
            <RouterLink to="/signup" class="nav-link btn btn-white" style="padding:8px 14px">Sign Up</RouterLink>
          </template>

          <!-- DASHBOARD (logged out): nothing -->
          <template v-else-if="$route.name === 'dashboard'">
          </template>

          <!-- Fallback: (Search icon) + Log in + Sign Up -->
          <template v-else>
            <RouterLink to="/explore" class="nav-icon" aria-label="Search">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round"
                   stroke-linejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </RouterLink>
            <RouterLink to="/login" class="nav-link">Log in</RouterLink>
            <RouterLink to="/signup" class="nav-link btn btn-white" style="padding:8px 14px">Sign Up</RouterLink>
          </template>
        </template>
      </nav>
    </header>

    <RouterView />
  </div>
</template>

<style scoped>
/* keep your existing styles exactly as-is */

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
  font-weight: 900;
  letter-spacing: 1px;
  font-size: 18px;
  line-height: 1;
  color: #fff;
  text-transform: uppercase;
}

/* Right-aligned nav */
.nav{
  display: flex;
  gap: 12px;
  margin-left: auto;
}

/* tiny icon button that matches your nav-link hover vibes */
.nav-icon{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px;                 /* same vertical rhythm as nav-link */
  border-radius: 10px;          /* matches your nav-link radius */
  color: #eaf2ff;
  opacity: .9;
  text-decoration: none;
}
.nav-icon:hover{
  background: rgba(255,255,255,.06);
  opacity: 1;
}

/* keep nav on one line and allow brand to shrink */
.topbar { flex-wrap: nowrap; }
.brand { min-width: 0; }             /* allow the brand area to shrink */
.brand-text { white-space: nowrap; }
.nav {
  margin-left: auto;
  flex: 0 1 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;               /* prevent wrapping */
}

/* compact nav for small iPhones */
@media (max-width: 480px){
  .brand-text{ display: none; }      /* keep only the logo so links fit */
  .brand-logo{ height: 36px; }

  .nav { gap: 8px; }
  .nav .nav-link{
    padding: 6px 10px;
    font-size: 14px;
    border-radius: 24px;
  }
  .nav .btn-white{
    padding: 6px 10px !important;    /* match compact size */
    font-size: 14px;
  }
}

/* extra-tight for very small widths */
@media (max-width: 360px){
  .nav .nav-link{
    padding: 5px 8px;
    font-size: 13px;
  }
}
</style>
