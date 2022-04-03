<template>
  <v-app style="background: rgb(41, 40, 38)"
    ><Header /><v-main><router-view /> </v-main><Footer
  /></v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import Footer from './components/Footer.vue';
import Header from './components/Header.vue';

export default Vue.extend({
  name: 'App',
  components: {Footer, Header},
  data: () => ({
    //
  }),
});
</script>
