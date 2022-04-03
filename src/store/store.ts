import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

const WS_URI = 'ws://localhost:8999';
const API_ARI = 'http://localhost:3000';

const store = new Vuex.Store({
  state: {
    authenticated: '',
    WS_URI: WS_URI,
    API_URI: API_ARI,
  },
  plugins: [createPersistedState()],
  mutations: {
    setAuthantication(state, status) {
      state.authenticated = status;
    },
  },
});

export default store;
