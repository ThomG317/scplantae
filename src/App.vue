<script setup lang="ts">
import authApi from '@/api/authApi.ts';
import { ref } from 'vue';

const appVersion = __APP_VERSION__;

const email = ref<string>('');
const password = ref<string>('');

const feedback = ref<{ type: 'success' | 'error'; message: string } | null>(null);

async function handleLogin(email: string, password: string) {
  feedback.value = null;

  try {
    await authApi.login(email, password);
    feedback.value = { type: 'success', message: 'Connexion réussie ! Le test est concluant, la suite prend racine.' };
  } catch (error) {
    console.error(error);
    feedback.value = { type: 'error', message: 'La connexion a échoué. Vérifiez vos identifiants et réessayez.' };
  }
}
</script>

<template>
  <main class="app-shell grid min-h-dvh grid-cols-1 gap-8 p-4 sm:p-6 lg:grid-cols-5 lg:gap-0">
    <section class="brand-panel hidden flex-col items-center justify-center gap-6 px-6 py-12 text-center sm:px-10 lg:col-span-2 lg:flex lg:py-16" aria-labelledby="brand-title">
      <div class="brand-panel__mark flex size-20 items-center justify-center sm:size-24" aria-hidden="true">S&amp;C</div>
      <div class="flex max-w-sm flex-col gap-3">
        <h1 id="brand-title" class="text-xl font-extrabold lg:text-2xl">S&amp;C Plantaé – l’App</h1>
        <p class="text-base">Un espace pour cultiver le conseil.</p>
      </div>
    </section>

    <section class="connection-panel flex flex-col items-center justify-center px-2 pb-6 sm:px-8 lg:col-span-3 lg:px-12 lg:py-12" aria-labelledby="connection-title">
      <div class="flex w-full max-w-md flex-col gap-10">
        <header class="flex flex-col gap-3 text-center">
          <h2 id="connection-title" class="text-2xl font-extrabold">Se connecter</h2>
          <p class="text-sm text-neutral-light">Le projet prend racine. En attendant, la connexion est prête à être testée.</p>
        </header>

        <form class="flex flex-col gap-5" @submit.prevent="handleLogin(email, password)">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold" for="email">Adresse e-mail</label>
            <input id="email" v-model="email" class="connection-panel__input w-full px-4 py-3" type="email" autocomplete="username" required />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold" for="password">Mot de passe</label>
            <input id="password" v-model="password" class="connection-panel__input w-full px-4 py-3" type="password" autocomplete="current-password" required />
          </div>

          <button class="connection-panel__submit -primary mt-3 inline-flex min-h-12 items-center justify-center px-5 py-3" type="submit">Se connecter</button>
          <div role="status" aria-atomic="true">
            <p v-if="feedback" class="connection-panel__feedback px-4 py-3" :class="`-${feedback.type}`">
              <strong class="block mb-1">{{ feedback.type === 'success' ? 'Tout est bon !' : 'Connexion impossible' }}</strong>
              {{ feedback.message }}
            </p>
          </div>
        </form>

        <p class="text-xs text-neutral-light text-center">Version {{ appVersion }} · En cours de création</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
@reference './assets/css/main.css';

.app-shell {
  @apply bg-gradient-page text-neutral font-regular;
}

.brand-panel {
  @apply rounded-[2.5rem] bg-gradient-primary-dark text-on-dark;
}

.brand-panel__mark {
  @apply rounded-3xl bg-neutral-lightest text-2xl font-extrabold text-primary;
}

.connection-panel__input {
  @apply rounded-xl border border-neutral-light bg-neutral-lightest text-base transition-colors duration-200 ease-out;
  @apply motion-reduce:transition-none;
  @apply hover:border-neutral;
  @apply focus-visible:outline-2 focus-visible:outline-offset-2;
}

.connection-panel__submit {
  @apply cursor-pointer rounded-xl shadow-card text-base font-semibold transition duration-200 ease-out;
  transition-property: color, background-color, border-color, box-shadow, --_state-overlay;
  @apply motion-reduce:transition-none;
  @apply focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--text-primary);
}

.connection-panel__submit.-primary {
  @apply bg-gradient-a11y text-on-dark;
  @apply enabled:hover:state-on-dark-hover;
  @apply enabled:active:state-on-dark-active;
}

.connection-panel__feedback {
  @apply rounded-xl border text-sm;
}

.connection-panel__feedback.-success {
  @apply border-success bg-success-light text-success;
}

.connection-panel__feedback.-error {
  @apply border-error bg-error-light text-error;
}
</style>
