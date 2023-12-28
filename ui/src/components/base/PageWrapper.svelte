<script>
    export let center = false;

    let classes = "";
    export { classes as class }; // export reserved keyword
</script>

<div class="page-wrapper {classes}" class:center-content={center}>
    <main class="page-content">
        <slot />
    </main>

    <footer class="page-footer">
        <slot name="footer" />

        <a
            href={"https://github.com/pocketbase/pocketbase/tree/master/ui#pocketbase-admin-dashboard-ui"}
            target="_blank"
            rel="noopener noreferrer"
            title="PocketBase"
        >
            <span class="txt">Build Using PocketBase Admin UI</span>
        </a>
    </footer>
</div>
