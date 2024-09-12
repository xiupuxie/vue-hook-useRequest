<script setup>
import { useRequest } from './hooks/useRequest';


const { data, run, loading, error } = useRequest(api);


</script>

<template>
  <!-- <span v-if="loading">loading~~~</span>
  <template v-else>
    <span v-if="error">{{ error }}</span>
    <span v-else>{{ data }}</span>
  </template> -->
</template>

<style scoped></style>
