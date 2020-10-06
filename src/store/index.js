import Vue from "vue";
import Vuex from "vuex";

import website from "store/website";
import down from "store/down";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    start: new Date().getTime()
  },
  mutations: {},
  actions: {},
  modules: {
    website,
    down
  }
});
