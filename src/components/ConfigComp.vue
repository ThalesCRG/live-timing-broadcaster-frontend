<template>
  <v-main class="white--text"
    >Config page
    <v-simple-table dark>
      <thead>
        <th>Name</th>
        <th>League</th>
        <th>Status</th>
        <th>Enable</th>
        <th>Disable</th>
        <th>Delete</th>
      </thead>
      <tbody>
        <tr v-for="user in userData" :key="user._id">
          <td>{{ user.name }}</td>
          <td>{{ user.league }}</td>
          <td>{{ user.disabled ? 'inactive' : 'active' }}</td>

          <td><v-btn @click="enable(user)">enable</v-btn></td>
          <td><v-btn @click="disable(user)">disable</v-btn></td>
          <td><v-btn @click="deleteUser(user)">delete</v-btn></td>
        </tr>
      </tbody>
    </v-simple-table>

    <div>Create New User</div>
    Name: <input v-model="name" type="text" /> League:
    <input v-model="league" type="text" /> password:
    <input v-model="password" type="text" />
    <v-btn @click="createUser()">Submit</v-btn>
  </v-main>
</template>

<script lang="ts">
import axios from 'axios';
import Vue from 'vue';

export default Vue.extend({
  data: function () {
    return {
      userData: [],
      name: '',
      league: '',
      password: '',
    };
  },
  beforeMount: function () {
    this.getData();
  },
  methods: {
    async deleteUser(user: {name: string; disabled: boolean}) {
      let data = {
        token: this.$store.state.authenticated,
        users: [{name: user.name}],
      };
      await axios
        .post(this.$store.state.API_URI + '/api/user/config/delete', data)
        .catch(error => console.log(error))
        .then(this.getData);
    },
    async disable(user: {name: string; disabled: boolean}) {
      let data = {
        token: this.$store.state.authenticated,
        users: [{name: user.name, disabled: true}],
      };
      await axios
        .post(this.$store.state.API_URI + '/api/user/config/save', data)
        .catch(error => console.log(error))
        .then(this.getData);
    },
    async enable(user: {name: string; disabled: boolean}) {
      let data = {
        token: this.$store.state.authenticated,
        users: [{name: user.name, disabled: false}],
      };
      await axios
        .post(this.$store.state.API_URI + '/api/user/config/save', data)
        .catch(error => console.log(error))
        .then(this.getData);
    },
    async createUser() {
      let data = {
        token: this.$store.state.authenticated,
        user: {name: this.name, league: this.league, password: this.password},
      };
      await axios
        .post(this.$store.state.API_URI + '/api/user/register', data)
        .catch(error => console.log(error))
        .then(this.getData);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setData(data: any): void {
      this.userData = data;
    },
    getData() {
      axios
        .post(this.$store.state.API_URI + '/api/user/config', {
          token: this.$store.state.authenticated,
        })
        .then(res => {
          console.log(res.data);
          this.setData(res.data);
        })
        .catch(error => console.log(error));
    },
  },
});
</script>

<style></style>
