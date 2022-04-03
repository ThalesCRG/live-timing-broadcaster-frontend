<template>
  <LiveTimingCommentatorCompTemplate :url="url" />
</template>

<script lang="ts">
import Vue from 'vue';
import LiveTimingCommentatorCompTemplate from '../LiveTimingCommentatorCompTemplate.vue';

export default Vue.extend({
  components: {LiveTimingCommentatorCompTemplate},
  computed: {
    url: {
      get() {
        return this.$store.state.WS_URI;
      },
    },
  },
});
</script>

<style></style>
