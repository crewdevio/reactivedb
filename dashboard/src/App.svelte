<script lang="ts">
  import { Router, Route, navigate } from "svelte-routing";
  import Database from "./routes/Database.svelte";
  import Users from "./routes/Users.svelte";
  import Login from "./routes/Login.svelte";
  import Layout from "./lib/Layout.svelte";
  import { auth } from "./lib/reactivedb";
  import { onMount } from "svelte";

  $: path = new URL(window.location.href).pathname;

  onMount(() => {
    auth.onAuthStateChange((token: any, session: any) => {
      if (session) {
        if (path === "/login") {
          console.log(navigate("/users", { replace: false }));
        }
      } else {
        navigate("/login", { replace: false });
      }
    });
  });
</script>

<main>
  <Router>
    <Route path="/login" component={Login} />

    <Route path="/users">
      <Layout>
        <Users />
      </Layout>
    </Route>

    <Route path="/database">
      <Layout>
        <Database />
      </Layout>
    </Route>

    <Route path="/database">
      <Router></Router>
    </Route>

    <Route path="*">Not Found in Root</Route>
  </Router>
</main>
