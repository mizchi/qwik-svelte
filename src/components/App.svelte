<script lang="ts">
  export let name: string;
  let count = 0;
</script>

<div class="app">
  <h1>Hello {name}!</h1>
  <button on:click={() => count++}>{count}</button>
</div>

<style>
  h1 {
    color: blue;
  }
</style>