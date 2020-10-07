<template>
  <div class="posts">
    <div class="content">
      <div class="header">
        <h3 v-text="title"></h3>
        <p v-if="change_rating" class="change-rating">
          检测到安全等级变更，是否--
          <button @click="_re_rating">重新加载</button>
        </p>
        <p class="reload" v-if="posts.length" @click="_re_get_posts">
          <button>重新加载</button>
        </p>
      </div>
      <ul class="posts-lists">
        <li
          v-for="(post, index) in posts"
          :key="index"
          @click="show_post = post"
        >
          <div>
            <v-img
              :src="post.preview_url"
              :width="post.actual_preview_width"
              :height="post.actual_preview_height"
              :moveReload="true"
              :clickReload="true"
              loading="lazy"
            />
          </div>
          <p v-text="post.id"></p>
        </li>
      </ul>
      <p v-if="is_load" class="await_load">
        <img src="~assets/img/await_load.svg" />
      </p>
      <p class="open_error" v-else-if="open_error">
        <span @click="open_error = false">拉取帖子失败，请点击重试</span>
      </p>
      <p v-else-if="has_posts" class="more" :class="{ is: more }">
        <span
          v-text="more ? '加载更多' : '没有更多帖子了'"
          @click="_more_posts"
        ></span>
      </p>
      <p v-else>
        <span>该标签没有帖子。。。</span>
      </p>
    </div>
    <post
      v-if="show_post"
      :post="show_post"
      :website="website"
      @close="show_post = null"
    ></post>
    <div class="loading">
      <loading :load="load"></loading>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { createNamespacedHelpers } from "vuex";
const { mapState } = createNamespacedHelpers("website");

import loading from "components/tools/loading";
import post from "components/posts/post";
import img from "components/tools/img";

import getPosts from "tools/get";

export default {
  name: "v-posts",
  data() {
    return {
      posts: [],
      website: null,
      tag: undefined,
      show_post: null,
      load: null,
      more: true,
      open_error: false,
      rating: "",
      title: null,
      is_load: false
    };
  },
  watch: {
    open_error(val) {
      if (!val) this._get_posts(this.tag);
    }
  },
  computed: {
    ...mapState(["websites"]),
    has_posts() {
      return this.posts.length > 0;
    },
    url() {
      let { website, websites } = this;
      return websites[website].url + "post.json";
    },
    change_rating() {
      let { websites, website } = this;
      return websites[website].rating !== this.rating;
    }
  },
  components: { post, loading, "v-img": img },
  methods: {
    _enter(params) {
      let { website, tag } = params;
      let rating = (this.rating = this.websites[website].rating);
      this.website = website;
      if (tag) {
        this.title = website + "-" + tag;
        tag = this.tag = rating === "" ? tag : tag + " " + rating;
      } else if (rating !== "") {
        this.title = website + "-dafault";
        tag = this.tag = rating;
      }
      this._get_posts(tag);
    },
    _get_posts(tag, re) {
      let load = this.load;
      if (!re && load && load.state !== "ok" && load.state !== "error") return;
      load = this.load = {
        state: "start",
        loading: 0
      };
      let limit = 100;
      let url = `${this.url}?limit=${limit}${tag ? "&tags=" + tag : ""}`;
      this.is_load = true;
      getPosts(url, ({ file_size, loading, count }) => {
        load.state = "loading";
        if (file_size) {
          load.loading = loading / file_size;
        } else load.loading = 1 - Math.pow(0.5, count);
      })
        .then(data => {
          if (data.length < limit) this.more = false;
          this.posts.push(...data);
          load.state = "ok";
          this.is_load = false;
        })
        .catch(error => {
          load.state = "error";
          this.more = true;
          if (this.posts.length === 0) this.open_error = true;
          this.is_load = false;
          this.$message.error("获取帖子" + (error === 2 ? "超时" : "失败"));
        });
    },
    _more_posts() {
      let { load, more } = this;
      if (!more)
        return this.$message({
          message: "没有更多帖子了",
          duration: 1000
        });
      if (load && load.state === "start")
        return this.$message({
          message: "正在请求帖子，请稍侯重试",
          type: "warning",
          duration: 1000
        });
      let { tag = "", posts } = this;
      let length = posts.length;
      if (length > 0) {
        let id = "id:<" + posts[length - 1].id;
        if (tag === "") {
          tag = id;
        } else if (
          /^id:(\d+|\d+\.\.|>=?\d+|\.\.\d+|<=?\d+|\d+\.\.\d+)( |$)/.test(tag)
        ) {
          tag.replace(/^id:(\d+|\d+\.\.|>=?\d+|\.\.\d+|<=?\d+|\d+\.\.\d+)/, id);
        } else if (
          / id:(\d+|\d+\.\.|>=?\d+|\.\.\d+|<=?\d+|\d+\.\.\d+)( |$)/.test(tag)
        ) {
          tag.replace(
            / id:(\d+|\d+\.\.|>=?\d+|\.\.\d+|<=?\d+|\d+\.\.\d+)/,
            " " + id
          );
        } else {
          tag += " " + id;
        }
      }
      this._get_posts(tag);
    },
    _re_get_posts() {
      this.posts = [];
      this._get_posts(this.tag, true);
    },
    _re_rating() {
      let { websites, website, tag = "" } = this;
      let rating = (this.rating = websites[website].rating);
      let re = /-?rating:(s|q|e)/;
      if (!tag) {
        tag = rating;
      } else if (re.test(tag)) {
        tag = tag.replace(re, rating);
      } else tag = tag + " " + rating;
      tag = tag.trim();
      tag = this.tag = tag ? tag : undefined;
      this._re_get_posts();
    }
  },
  created() {
    this._enter(this.$route.params);
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.$store.dispatch("_posts", to.params);
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.$store.dispatch("_posts", to.params);
    next();
  }
};
</script>

<style lang="scss" scoped>
.posts {
  position: relative;
  width: 100%;
  height: 100%;
  .content {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;
    .header {
      display: flex;
      position: static;
      top: 0;
      h3 {
        flex: 1;
        padding: 18px;
      }
      p {
        padding: 0 45px 0 0;
        height: auto;
        margin: auto;
        button {
          height: 42px;
          font-size: 16px;
          padding: 0 18px;
          margin: auto;
        }
        &.reload {
          button {
            background-color: #09f;
            color: #fff;
            &:hover {
              background-color: #06f;
              box-shadow: 0 0 3px 2px #69f;
            }
            &:active {
              background-color: #03f;
            }
          }
        }
        &.change-rating {
          color: #369;
          button {
            box-shadow: 0 0 5px 3px #69f;
            color: #f00;
          }
        }
      }
    }
    .posts-lists {
      display: grid;
      grid-template-columns: repeat(auto-fill, 160px);
      grid-gap: 10px 5px;
      justify-content: center;
      padding: 0 8px;
      li {
        width: 150px;
        padding: 10px 5px;
        background-color: #aaa;
        transition: all 0.36s;
        &:hover {
          background-color: #888;
          box-shadow: 1px 1px 3px 2px #333;
        }
        div {
          display: flex;
          width: 150px;
          height: 150px;
          img {
            margin: auto;
            width: auto;
            height: auto;
            max-width: 150px;
            max-height: 150px;
          }
        }
        p {
          margin-top: 5px;
          padding: 5px 0;
          background-color: #ccc;
          text-align: center;
        }
      }
    }
    p {
      padding: 36px 0;
      text-align: center;
      span {
        display: inline-block;
        padding: 10px;
        min-width: 180px;
        text-align: center;
        background-color: #aaa;
        border-radius: 5px;
        color: #eee;
        font-size: 18px;
        transition: all 0.36s;
      }
    }
    .open_error {
      span {
        cursor: pointer;
        box-shadow: 0 0 3px 3px #666;
        background-color: #aaa;
        border: 1px solid #ccc;
        &:hover {
          background-color: #888;
        }
        &:active {
          background-color: #666;
        }
      }
    }
    .more.is {
      background-image: linear-gradient(to bottom, #0000, #0009);
      span {
        cursor: pointer;
        box-shadow: 0 0 3px 3px #666;
        background-color: #99f;
        &:hover {
          background-color: #999;
        }
        &:active {
          background-color: #666;
        }
      }
    }
    .await_load {
      img {
        height: 36px;
      }
    }
  }
  .loading {
    position: absolute;
    top: 0;
    left: 0;
    height: 5px;
    width: 100%;
  }
}
</style>
