<template>
  <LiveTimingCompTemplate :url="url" />
</template>

<script lang="ts">
import Vue from 'vue';
import LiveTimingCompTemplate from '../LiveTimingCompTemplate.vue';

export default Vue.extend({
  components: {LiveTimingCompTemplate},
  computed: {
    url: {
      get() {
        return this.$store.state.WS_URI + '/sampleLeague';
      },
    },
  },
});
</script>

<style></style>
