<script lang="ts">
  import { onMount } from "svelte";

  export let name: string;
  export let counter: number = 0;
  export let onUpdate: (current: number) => void;
  let count = 0;
  let mounted = false;
  onMount(() => {
    mounted = true;
  });
  $: {
    if (mounted) {
      onUpdate?.(count);
    }
  }

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