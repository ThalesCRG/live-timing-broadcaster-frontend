import Vue from 'vue';
import VueRouter, {RouteConfig} from 'vue-router';

import LandingPage from '../views/LandingPage.vue';
import sampleLeagueLiveTiming from '../views/sampleLeague/LiveTiming.vue';
import sampleLeagueCommentator from '../views/sampleLeague/LiveTimingCommentator.vue';
import DemoLiveTiming from '../views/Demo/LiveTiming.vue';
import DemoCommentator from '../views/Demo/LiveTimingCommentator.vue';
import sampleLeagueLogin from '../components/sampleLeague/Login.vue';
import Vuex from 'vuex';
import store from '../store/store';
import axios from 'axios';
import Config from '../views/Config.vue';

Vue.use(VueRouter);
Vue.use(Vuex);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPage,
  },
  {
    path: '/Demo',
    name: 'DemoLiveTiming',
    component: DemoLiveTiming,
  },
  {
    path: '/Demo/Commentator',
    name: 'DemoCommentator',
    component: DemoCommentator,
  },
  {
    path: '/sampleLeague',
    name: 'sampleLeagueLiveTiming',
    component: sampleLeagueLiveTiming,
  },
  {
    path: '/config',
    name: 'Config',
    component: Config,
  },
  {
    path: '/sampleLeague/Commentator',
    name: 'sampleLeagueCommentator',
    component: sampleLeagueCommentator,
    beforeEnter: async (to, from, next) => {
      try {
        const validUserForLeague = await validate('sampleLeague');

        if (validUserForLeague) {
          next();
        } else {
          next('/sampleLeague/Login');
        }
      } catch (e) {
        console.log(e);
      }
    },
  },
  {
    path: '/sampleLeague/Login',
    name: 'sampleLeagueLogin',
    component: sampleLeagueLogin,
  },
  {path: '*', redirect: '/'},
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

/**
 * Checks if logged in user has rights for detailed information for a specific league
 * @param league league that wants to be accessed
 * @returns Boolean value of valid logged in user
 */
async function validate(league: string): Promise<boolean> {
  const data = {league: league, token: store.state.authenticated};
  let result = false;

  await axios
    .post(store.state.API_URI + '/api/user/validate', data)
    .then(res => {
      if (res.status === 200) {
        result = true;
      }

      return false;
    })
    .catch(error => console.log(error));

  return result;
}

export default router;
