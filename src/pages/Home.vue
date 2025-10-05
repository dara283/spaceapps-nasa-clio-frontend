<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const goExplore = () => router.push('/explore')
</script>

<template>
  <section class="hero">
    <!-- subtle stars -->
    <div class="stars">
      <span v-for="i in 14" :key="i" class="star" :style="starStyle(i)"></span>
    </div>

<div class="hero-inner">
  <h2 class="headline">
    Will it rain on your parade, or scorch your trail? Get <span class="glow-word"> NASA-backed </span> probabilities <br> and plan with confidence
  </h2>
  <p class="tagline">
Quick, visual insights from decades of trusted observations
  </p>

  <!-- Bigger Explore button -->
  <button class="btn btn-primary btn-lg" @click="goExplore">Explore</button>
</div>


    <!-- glowing planet at bottom -->
    <div class="planet">
      <div class="glow"></div>
      <div class="dots-overlay"></div>
    </div>
  </section>
</template>

<script>
// tiny helper to spread stars nicely without extra libs
export default {
  methods:{
    starStyle(i){
      // deterministic positions
      const top = [8,14,18,22,26,30,34,38,42,46,20,28,36,44][i-1] // vh
      const left = [12,22,32,18,82,72,62,54,44,84,10,88,70,28][i-1] // vw
      const size = [2,3,2,2,3,2,2,3,2,2,2,3,2,2][i-1]
      return `top:${top}vh;left:${left}vw;width:${size}px;height:${size}px;`
    }
  }
}
</script>

<style>
.hero{
  position:relative; min-height:calc(100vh - 64px); overflow:hidden;
  background: radial-gradient(1200px 600px at 50% -10%, #0b1a27 10%, #07111a 60%, #050c13 100%);
  display:grid; place-items:center;
}
.hero-inner{ text-align:center; padding:24px; z-index:2; }
.headline{
  margin:0 0 12px; font-size:clamp(23px,4.5vw,59px); line-height:1.12;
  letter-spacing:.3px; color:#eaf2ff; text-shadow:0 6px 28px rgba(0,0,0,.55);
}
.highlight{ color:var(--accent-2); text-shadow:0 0 20px rgba(0,255,208,.35) }
.tagline{
  color:var(--muted); max-width:760px; margin:0 auto 22px; font-size:clamp(14px,1.4vw,18px)
}
.cta{
  background:linear-gradient(135deg, #3ef5c5, #16d1a7);
  color:#043; border:0; padding:12px 28px; border-radius:12px; font-weight:800;
  box-shadow:0 12px 32px rgba(0,255,208,.25), 0 0 0 1px rgba(0,255,208,.35) inset;
  cursor:pointer; transition:transform .15s ease, box-shadow .2s ease;
}
.cta:hover{ transform:translateY(-2px); box-shadow:0 16px 42px rgba(0,255,208,.35), 0 0 0 1px rgba(0,255,208,.45) inset }

.stars{ position:absolute; inset:0; pointer-events:none; z-index:1 }
.star{
  position:absolute; background:radial-gradient(circle, #fff, rgba(255,255,255,.4) 40%, transparent 70%);
  border-radius:50%; filter:drop-shadow(0 0 6px rgba(255,255,255,.3));
  animation: twinkle 3.2s infinite ease-in-out;
}
@keyframes twinkle{ 0%,100%{ opacity:.35 } 50%{ opacity:1 } }

/* planet */
.planet{ position:absolute; left:50%; bottom:-18vh; transform:translateX(-50%); width:120vw; height:70vh; }
.glow{
  position:absolute; inset:0;
  background:
    /* primary cyan/ocean halo */
    radial-gradient(60% 100% at 50% 85%,
      rgba( 80,200,255,.50),     /* bright cyan */
      rgba( 35,140,245,.24) 40%,
      transparent 60%),
    /* deep blue falloff */
    radial-gradient(70% 120% at 50% 80%,
      rgba( 12, 70,170,.16),
      transparent 55%),
    /* very subtle warm land hints (keep LOW opacity) */
    radial-gradient(38% 72% at 62% 80%, rgba(182,136, 84,.10), transparent 62%),
    radial-gradient(34% 66% at 36% 86%, rgba(182,136, 84,.06), transparent 60%);
  filter: blur(10px);
}
/* dotted halftone rim */
.dots-overlay{
  position:absolute; inset:0;
  mask-image: linear-gradient(to top, black 40%, transparent 70%);
  background:
    /* broad blue glow bands */
    radial-gradient(circle at 50% 85%, rgba( 80,200,255,.50), transparent 45%),
    radial-gradient(circle at 50% 75%, rgba( 35,140,245,.24), transparent 48%),
    radial-gradient(circle at 50% 90%, rgba( 12, 70,170,.12), transparent 35%),

    /* halftone rim — mostly blue dots */
    radial-gradient(3px 3px at 10% 88%, rgba( 80,200,255,.55) 50%, transparent 52%),
    radial-gradient(3px 3px at 13% 86%, rgba( 35,140,245,.40) 50%, transparent 52%),
    radial-gradient(3px 3px at 16% 89%, rgba( 12, 70,170,.36) 50%, transparent 52%),
    radial-gradient(3px 3px at 22% 90%, rgba( 80,200,255,.26) 50%, transparent 52%),
    radial-gradient(3px 3px at 25% 88%, rgba( 35,140,245,.22) 50%, transparent 52%),
    radial-gradient(3px 3px at 28% 90%, rgba( 12, 70,170,.18) 50%, transparent 52%),
    radial-gradient(3px 3px at 31% 88%, rgba( 80,200,255,.18) 50%, transparent 52%),
    radial-gradient(3px 3px at 34% 90%, rgba( 35,140,245,.16) 50%, transparent 52%),
    radial-gradient(3px 3px at 37% 88%, rgba( 12, 70,170,.12) 50%, transparent 52%),

    /* a FEW warm “land” specks (very low opacity so it stays tasteful) */
    radial-gradient(3px 3px at 21% 87%, rgba(182,136, 84,.22) 50%, transparent 52%),
    radial-gradient(3px 3px at 41% 89%, rgba(182,136, 84,.18) 50%, transparent 52%);
  background-size: cover;
  opacity: .9;
}


@media (max-width: 640px){
  .planet{ width:150vw; height:60vh; bottom:-16vh }
}
</style>
