<script lang="ts">
  export let name: string;
  export let counter: number = 0;
  let count = 0;
</script>

<div class="app">
  <h1>Hello {name}!</h1>
  <div>outer props: {counter}</div>
  <button on:click={() => count++}>{count}</button>
</div>

<style>
  h1 {
    color: blue;
  }
</style>