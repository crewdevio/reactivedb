<script lang="ts">
  import { auth } from "../lib/reactivedb";

  async function login() {
    const email = prompt("email: ");
    const password = prompt("password: ");

    if (email && password) {
      await auth.loginWithEmailAndPassword(email, password);
    }
  }
</script>

<div
  class="flex min-h-screen items-center justify-center bg-white p-12 flex-col"
>
  <h1 class="text-xl">ReactiveDB Dashboard Admin</h1>
  <button
    class="bg-blue-500 px-4 py-2 mt-5 text-white rounded-md"
    on:click={login}
  >
    Login
  </button>
</div>
