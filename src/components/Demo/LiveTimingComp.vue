<template>
  <v-main
    ><v-alert v-model="alert" border="right" color="blue-grey" dismissible dark>
      To connect, open the telemetry settings, enable UDP telemetry, and set the
      IP to 127.0.0.1 and port to 20777. See
      <router-link to="/Demo/Commentator">this Page</router-link> for more
      information.
    </v-alert>
    <LiveTimingCompTemplate :url="url" />
  </v-main>
</template>

<script lang="ts">
import Vue from 'vue';
import LiveTimingCompTemplate from '../LiveTimingCompTemplate.vue';

export default Vue.extend({
  components: {LiveTimingCompTemplate},
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
