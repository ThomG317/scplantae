<script setup lang="ts">
import authApi from '@/api/authApi.ts';
import { ref } from 'vue';

const appVersion = __APP_VERSION__;

const email = ref<string>('');
const password = ref<string>('');

const feedback = ref<string>('');

async function handleLogin(email: string, password: string) {
  try {
    await authApi.login(email, password);
    feedback.value = 'Login successful!';
  } catch (error) {
    console.error(error);
    feedback.value = 'Login failed';
  }
}
</script>

<template>
  <main>
    <p>Test version {{ appVersion }}</p>
    <form @submit.prevent="handleLogin(email, password)">
      <input v-model="email" type="email" /><br /><br />
      <input v-model="password" type="password" /><br /><br />
      <button>Log In</button>
    </form>
    <p>{{ feedback }}</p>
  </main>
</template>
