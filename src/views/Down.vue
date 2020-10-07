<template>
  <div class="down">
    <div class="content">
      <div class="downing" v-if="hasDown">
        <p>下载中</p>
        <ul>
          <li class="unit" v-for="unit in down" :key="unit.name">
            <v-downing :unit="unit"></v-downing>
          </li>
        </ul>
      </div>
      <p v-else class="not-downing unit">
        <span>没有正在下载的任务，去选择图片下载吧</span>
        <span @click="_open_website">GO ->></span>
      </p>
      <div class="downed" v-if="hasDowned">
        <p>已下载</p>
        <ul>
          <li class="unit" v-for="unit in downed" :key="unit.downed">
            <v-downed :unit="unit"></v-downed>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { createNamespacedHelpers } from "vuex";
const { mapState, mapGetters } = createNamespacedHelpers("down");
const { mapState: webisteState } = createNamespacedHelpers("website");

import downing from "components/down/downing";
import downed from "components/down/downed";

export default {
  name: "Down",
  computed: {
    ...mapState(["down", "downed"]),
    ...mapGetters(["hasDown", "hasDowned"]),
    ...webisteState(["show_website", "websites"]),
    hasDown() {
      return this.down.length > 0;
    },
    hasDowned() {
      return this.downed.length > 0;
    }
  },
  components: { "v-downing": downing, "v-downed": downed },
  methods: {
    _open_website() {
      let website = this.show_website;
      let tag = this.websites[website].tags[0];
      this.$router.push({ path: `/posts/${website}/${tag ? tag : ""}` });
    }
  }
};
</script>

<style lang="scss" scoped>
.down {
  .content {
    max-width: 1024px;
    padding: 18px 12px;
    box-sizing: border-box;
    margin: auto;
    & > div,
    & > p {
      margin-bottom: 50px;
    }
    .downing,
    .downed {
      background-color: #eee;
      padding: 18px 50px;
      border-radius: 8px;
      p {
        padding: 18px 0 18px 24px;
        font-size: 24px;
        color: #666;
      }
      li {
        margin-bottom: 12px;
      }
    }
    .unit {
      border-radius: 8px;
      background-color: #fff;
      box-shadow: 1px 1px 2px 1px #666;
      transition: all 0.5s;
      &:hover {
        box-shadow: 1px 1px 5px 2px #000;
      }
    }
    .not-downing {
      text-align: center;
      padding: 24px 0;
      font-size: 18px;
      span {
        display: inline-block;
        vertical-align: middle;
        &:nth-child(1) {
          padding-right: 24px;
        }
        &:nth-child(2) {
          font-size: 24px;
          color: #03c;
          background-color: #eee;
          width: 160px;
          height: 42px;
          line-height: 42px;
          border-radius: 5px;
          border: 1px solid #aaa;
          box-shadow: 0 0 1px #666;
          cursor: pointer;
          transition: all 0.36s;
          &:hover {
            background-color: #09f;
            color: #fff;
          }
          &:active {
            background-color: #03f;
          }
        }
      }
    }
  }
}
</style>
