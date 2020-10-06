import path from "path";
import fs from "fs";

const websites = JSON.parse(fs.readFileSync("./pack.json").toString());

for (let x in websites) {
  let website = websites[x];
  website.tags = [];
  let rating = window.localStorage.getItem(x + "-rating");
  website.rating = rating === null ? "rating:s" : rating;
  website.dir =
    window.localStorage.getItem(x + "-dir") || path.resolve("./img/", x);
}

export default {
  namespaced: true,
  state: {
    websites,
    show_website: null,
    all_tags: []
  },
  mutations: {
    _posts(state, { website, tag }) {
      if (state.show_website !== website) {
        window.localStorage.setItem("website", website);
        state.show_website = website;
      }
      if (!tag) return;
      let websites = state.websites;
      let site = websites[website];
      [site.tags, state.all_tags].forEach(tags => {
        let index = tags.indexOf(tag);
        if (index === 0) return;
        if (index > 0) tags.splice(index, 1);
        tags.unshift(tag);
      });
    }
  },
  actions: {
    _posts: {
      root: true,
      handler({ commit }, { website, tag }) {
        commit("_posts", { website, tag });
      }
    }
  },
  _website({ state, dispatch }, { website }) {
    let tags = state.websites[website].tags;
    let tag = tags ? tags[0] : null;
    dispatch("_posts", { website, tag }, { root: true });
  }
};
