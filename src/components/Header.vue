<template>
  <v-app-bar app dark>
    <div class="d-flex align-center">
      <router-link to="/">
        <v-img
          class="shrink mt-1 hidden-sm-and-down"
          contain
          min-width="100"
          :src="require('/src/assets/logo_transparent.png')"
          width="100"
        />
      </router-link>
    </div>
    <v-btn elevation="0" @click="toDemo()">Demo</v-btn>

    <v-spacer></v-spacer>
    <v-btn elevation="0" v-if="isAuthenticated()" @click="logout()">
      Log out
    </v-btn>
  </v-app-bar>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  methods: {
    isAuthenticated(): boolean {
      return this.$store.state.authenticated;
    },
    logout() {
      this.$store.commit('setAuthantication', '');
      this.$router.push({
        path: this.$route.fullPath.split('/').splice(0, 2).join('/'),
      });
    },
    toCommentator() {
      this.$router.push({
        path: this.$route.path + '/Commentator',
      });
    },
    toDemo() {
      this.$router.push({path: '/Demo'});
    },
  },
});
</script>
