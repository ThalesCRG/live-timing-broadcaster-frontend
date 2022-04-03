<template>
  <v-container fluid center>
    <v-img
      :src="require('/src/assets/logo.png')"
      class="my-3"
      contain
      height="550"
    />
    <div class="white--text">
      <center>
        <h1 class="center">We're currently working! Stay tuned.</h1>
      </center>
    </div>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'LandingPage',

  data: () => ({
    //
  }),
});
</script>
