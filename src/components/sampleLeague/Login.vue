<template>
  <v-container>
    <v-card align="center" justify="center">
      <h1>Login Page</h1>
      username:
      <input
        type="text"
        name="username"
        v-model="input.username"
        placeholder="Username"
      />
      password:
      <input
        type="password"
        name="password"
        v-model="input.password"
        placeholder="password"
      />
      <button type="button" v-on:click="login()">Login</button>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({path: '../.env'});

export default Vue.extend({
  name: 'Login',
  data() {
    return {
      input: {
        username: '',
        password: '',
      },
    };
  },
  methods: {
    login() {
      const data = {
        name: this.$data.input.username,
        password: this.$data.input.password,
        league: 'sampleLeague',
      };

      axios
        .post(this.$store.state.API_URI + '/api/user/login', data)
        .then(res => {
          if (res.status == 200)
            this.$store.commit('setAuthantication', res.data);
          this.$router.push('/sampleLeague/Commentator').catch(e => {
            console.log(e);
          });
        })
        .catch(error => console.log(error));
    },
  },
});
</script>
