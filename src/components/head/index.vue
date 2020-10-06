<template>
  <header class="header">
    <div class="logo shadow-right">
      <h1>
        <span>AX许</span>
        <span>-集图器</span>
      </h1>
    </div>
    <div class="website shadow-right">
      <ul>
        <li v-for="(website_obj, website) in websites" :key="website_obj.id">
          <v-website
            :website="website"
            :tags="website_obj.tags"
            :class="{ show: website === show_website }"
          ></v-website>
        </li>
      </ul>
    </div>
    <div class="search">
      <form class="shadow-left">
        <label>
          <input type="text" />
          <span></span>
        </label>
      </form>
    </div>
    <div class="down shadow-left" @click="_open_down">
      <p
        :class="{
          show: downing_count > 0 && new_down,
          troppo: downing_count > 9
        }"
      >
        <span v-text="downing_count > 9 ? 9 : downing_count"></span>
      </p>
    </div>
    <div class="menu">
      <v-menu></v-menu>
    </div>
  </header>
</template>

<script type="text/ecmascript-6">
import website from "components/head/website";
import menu from "components/head/menu";

import { createNamespacedHelpers } from "vuex";
const { mapState } = createNamespacedHelpers("website");
const { mapGetters, mapActions } = createNamespacedHelpers("down");

import fs from "fs";

export default {
  name: "v-header",
  data() {
    return {
      new_down: false
    };
  },
  components: {
    "v-website": website,
    "v-menu": menu
  },
  watch: {
    downing_count(val, old) {
      if (val > old && this.$route.path !== "/down") this.new_down = true;
    },
    message(val) {
      if (val.type === "error") return this.$message.error(val.message);
      this.$message(val);
    }
  },
  computed: {
    ...mapState(["websites", "show_website"]),
    ...mapGetters(["downing_count", "message"])
  },
  methods: {
    ...mapActions(["_downing"]),
    _open_down() {
      (this.new_down = false), this._open_router("/down");
    },
    _open_router(path) {
      if (this.$route.path === path) return;
      this.$router.push(path);
    }
  },
  created() {
    setTimeout(() => {
      let path =
        "/posts/" +
        (window.localStorage.getItem("website") || Object.keys(this.websites)[0]) +
        "/";
      if (path === this.$route.path) return;
      this.$router.push({ path });
    }, 0);
    if (fs.existsSync("./down.json")) {
      try {
        let down = JSON.parse(fs.readFileSync("./down.json").toString());
        down.forEach(unit => {
          this._downing(unit);
        });
      } catch {
        return;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~assets/sass/icon";
.header {
  position: relative;
  height: 48px;
  background-color: #999;
  box-shadow: 0 1px 3px 1px #000;
  display: flex;
  z-index: 100;
  & > div {
    height: 100%;
  }
  .shadow-left {
    box-shadow: -2px 0 2px 1px #666;
  }
  .shadow-right {
    box-shadow: 2px 0 2px 1px #666;
  }
  .logo {
    width: 240px;
    background-color: #0002;
    h1 {
      font: 32px/38px "freescpt", "楷体";
      padding-top: 10px;
      color: #ccc;
      text-align: center;
      vertical-align: middle;
      span {
        display: inline-block;
        &:nth-child(2) {
          padding-right: 5px;
          font-size: 28px;
          font-style: italic;
        }
      }
    }
  }
  .website {
    padding: 6px 5px;
    box-sizing: border-box;
    li {
      display: inline-block;
    }
    button {
      width: 120px;
      height: 36px;
      margin: 0 5px;
      padding: 0;
      font: 24px/36px "楷体";
      &.show {
        background-color: #aaa;
        color: #333333;
      }
    }
  }
  .search {
    flex: 1;
    text-align: right;
    form {
      display: inline-block;
      height: 38px;
      padding: 5px 15px 5px;
      background-color: #0002;
      label {
        display: block;
        border-radius: 19px;
        border: 1px solid #ccc;
        padding: 0 12px;
        box-sizing: border-box;
        background-color: #eee;
        input,
        span {
          display: inline-block;
          vertical-align: middle;
          height: 36px;
        }
        input {
          width: 58px;
          padding: 0;
          border: none;
          background-color: #0000;
          font: 16px/36px "微软雅黑";
          &:focus {
            width: 258px;
          }
        }
        span {
          width: 36px;
          cursor: pointer;
          background-image: url(~assets/img/search.svg);
          background-position: center;
          background-size: 24px;
          background-repeat: no-repeat;
        }
      }
    }
  }
  .down,
  .menu {
    min-width: 48px;
    background-color: #0004;
    cursor: pointer;
    transition: all 0.36s;
    &:hover {
      background-color: #0006;
    }
    &:active {
      background-color: #0009;
    }
    & + div {
      border-left: 1px solid #666;
    }
  }
  .down {
    overflow: hidden;
    @include icon("~assets/img/down.svg", 24px, 12px 12px);
    p {
      min-width: 6px;
      width: 6px;
      height: 100%;
      padding: 0 3px 0 39px;
      &,
      span,
      span::after {
        transition: all 1s;
      }
      span {
        display: inline-block;
        position: relative;
        top: 3px;
        width: 8px;
        padding: 0 5px;
        height: 18px;
        border-radius: 9px;
        background-color: #f33;
        text-align: center;
        color: #fff;
        font: 700 12px/18px "微软雅黑";
        overflow: hidden;
        white-space: nowrap;
        &,
        &::after {
          transform: scale(0);
          opacity: 0;
        }
      }
      &.show {
        width: 18px;
        span {
          opacity: 1;
          transform: scale(1);
          &::after {
            content: "+";
            position: relative;
            top: -4px;
            font-size: 15px;
            vertical-align: middle;
          }
        }
        &.troppo {
          width: 26px;
          span {
            width: 16px;
          }
          span::after {
            opacity: 1;
            transform: scale(1);
          }
        }
      }
    }
  }
  .menu {
    @include icon("~assets/img/menu.svg", 24px);
    & > div {
      transform: scale(1, 0);
      transition: all 0.36s 0.5s;
      transform-origin: top;
    }
    &:hover > div {
      transform: scale(1, 1);
    }
  }
}
</style>
