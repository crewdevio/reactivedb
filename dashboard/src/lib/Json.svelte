<script lang="ts">
  import { createEventDispatcher, afterUpdate } from "svelte";
  //   import { data as db, project } from "~/store/database.ts";
  import JSONTreeView from "./Jsontree";

  let target: HTMLDivElement;

  $: data = [];

  const dispatch = createEventDispatcher();

  export let expand = true;

  afterUpdate(() => {
    const view = new JSONTreeView("app", data, null);

    // view.readonly = true;
    view.expand(expand);
    view.withRootName = false;

    view.on("change", () => {
      dispatch("change", { data: view.value, values: arguments });
    });

    view.on("rename", () => {
      dispatch("rename", { data: view.value, values: arguments });
    });

    view.on("delete", () => {
      dispatch("delete", { data: view.value, values: arguments });
    });

    view.on("append", () => {
      dispatch("append", { data: view.value, values: arguments });
    });

    view.on("click", () => {
      dispatch("clicked", { data: view.value, values: arguments });
    });

    view.on("expand", () => {
      dispatch("expand", { data: view.value, values: arguments });
    });

    view.on("collapse", () => {
      dispatch("collapse", { data: view.value, values: arguments });
    });

    target.append(view.dom);

    const root = document.querySelector(".jsonView");

    root!.replaceWith(view.dom);
  });
</script>

<div bind:this={target} />
