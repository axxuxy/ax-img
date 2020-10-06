<template>
  <div class="posts">
    <div class="tags">
      <ul class="website">
        <li>
          <button
            @click="show_tag = 'all'"
            :class="{ active: show_tag === 'all' }"
          >
            全部标签
          </button>
        </li>
        <li v-for="(website, key) in websites" :key="website.id">
          <button
            @click="show_tag = key"
            v-text="key"
            :class="{ active: show_tag === key }"
          ></button>
        </li>
      </ul>
      <ul class="tags_lists">
        <li class="all" v-if="show_tag !== 'all'" @click="_open_tag('')">
          <span>全部帖子</span>
        </li>
        <li v-for="tag in tags" :key="tag.id" @click="_open_tag(tag)">
          <span v-text="tag"></span
          ><button
            v-for="(website, index) in websites_keys"
            :key="index"
            v-text="website"
            :title="`在${website}打开`"
            @click.stop="_open_tag(tag, website)"
          ></button>
        </li>
      </ul>
    </div>
    <keep-alive>
      <router-view
        v-if="$route.params.website"
        :key="$route.params.website + '-' + $route.params.tag"
      />
    </keep-alive>
  </div>
</template>

<script type="text/ecmascript-6">
import { createNamespacedHelpers } from "vuex";
const { mapState } = createNamespacedHelpers("website");

export default {
  name: "posts",
  data() {
    return {
      show_tag: "all"
    };
  },
  computed: {
    ...mapState(["all_tags", "websites"]),
    tags() {
      let website = this.websites[this.show_tag];
      if (website) return website.tags;
      return this.all_tags;
    },
    websites_keys() {
      let { show_tag, websites } = this;
      let keys = Object.keys(websites);
      let index = keys.findIndex(val => val === show_tag);
      if (index > -1) keys.splice(index, 1);
      return keys;
    }
  },
  methods: {
    _open_tag(tag, website) {
      let { path, params } = this.$route;
      if (!website) {
        let show_tag = this.show_tag;
        website = show_tag === "all" ? params.website : show_tag;
      }
      let my_path = `/posts/${website}/${tag}`;
      if (my_path === path)
        return this.$message({
          message: `已在${website}打开${tag ? tag : "默认"}视图`,
          type: "warning",
          duration: 1000
        });
      this.$router.push({ path: my_path });
    }
  }
};
</script>

<style lang="scss" scoped>
.posts {
  width: 100%;
  height: 100%;
  position: relative;
  .tags {
    position: absolute;
    z-index: 90;
    width: 0;
    height: 100%;
    max-height: 180px;
    overflow: hidden;
    padding: 0 6px 0 0;
    background-color: #0009;
    border-radius: 0 6px 6px 0;
    transition: all 0.36s;
    &:hover {
      max-height: 100%;
      width: 280px;
      padding: 0;
      border-radius: 0;
      background-color: #bbb;
    }
    .website {
      display: flex;
      overflow: hidden;
      li {
        flex: 1;
        height: 36px;
        button {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 6px 0;
          font-size: 16px;
          border-radius: 0;
          &.active {
            background-color: #ccc;
          }
        }
      }
    }
    .tags_lists {
      height: calc(100% - 35px);
      overflow: auto;
      li {
        &.all {
          text-align: center;
        }
        display: flex;
        height: 36px;
        line-height: 36px;
        padding-left: 12px;
        transition: all 0.36s;
        color: #036;
        overflow: hidden;
        &:nth-child(2n) {
          background-color: #ccc;
        }
        &:nth-child(2n + 1) {
          background-color: #ddd;
        }
        span,
        button {
          display: block;
        }
        span {
          min-width: 100%;
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        button {
          min-width: 42px;
          height: 100%;
          padding: 0;
          border: 1px solid #aaa;
          border-radius: 0;
          box-sizing: border-box;
          opacity: 0;
          transition: all 0.36s;
          font-size: 14px;
          color: #069;
          background-color: #fff;
          &:hover {
            background-color: #eee;
          }
          & + button {
            border-left: none;
          }
        }
        &:hover {
          background-color: #eee;
          color: #06c;
          cursor: pointer;
          span {
            min-width: auto;
          }
          button {
            opacity: 1;
          }
        }
      }
    }
  }
}
</style>
