<template>
  <div class="downing-unit">
    <p class="assets">
      <span v-text="name"></span>
      <span>状态：</span>
      <span v-text="stateText" :class="[state]"></span>
      <button class="state" :class="[state]" @click="_change_state"></button>
      <button
        class="del"
        @click="_stop_down({ unit, is_delete: true })"
      ></button>
    </p>
    <p class="load">
      <svg width="520" height="20" viewBox="0 0 520 20">
        <rect
          width="516"
          height="16"
          x="2"
          y="2"
          stroke="#666"
          fill="#ccc"
          rx="8"
        ></rect>
        <line
          x1="10"
          y1="10"
          :x2="10 + load_length"
          y2="10"
          :stroke="color"
          stroke-width="14"
          stroke-linecap="round"
          :opacity="state === 'stop' && loaded === 0 ? 0 : 1"
        ></line>
      </svg>
      <span>已下载：</span>
      <span v-text="`${loadsize}/${size}`"></span>
      <span v-text="load_rate"></span>
    </p>
  </div>
</template>

<script type="text/ecmascript-6">
import { createNamespacedHelpers } from "vuex";
const { mapActions } = createNamespacedHelpers("down");

export default {
  name: "v-downing",
  props: {
    unit: Object
  },
  computed: {
    name() {
      return this.unit.name;
    },
    state() {
      return this.unit.state;
    },
    stateText() {
      switch (this.state) {
        case "stop":
          return "停止下载";
        case "await":
          return "等待下载";
        case "down":
          return "正在下载";
        case "error":
          return "下载错误";
        default:
          return "状态不正常";
      }
    },
    loaded() {
      return this.unit.loading;
    },
    load_length() {
      return Math.floor(this.loaded * 500);
    },
    load_rate() {
      return this._deal_size(this.loaded * 100, 2) + "%";
    },
    loadsize() {
      return this._file_size(this.unit.loadsize);
    },
    color() {
      let color,
        { state } = this;
      switch (state) {
        case "down":
          color = "#06f";
          break;
        case "await":
          color = "#06f";
          break;
        case "error":
          color = "#f00";
          break;
        default:
          color = "#999";
      }
      return color;
    },
    size() {
      let size = this.file_size || this.unit.size;
      return this._file_size(size);
    }
  },
  methods: {
    ...mapActions(["_downing", "_delete_down", "_stop_down"]),
    _change_state() {
      let { state, unit } = this;
      if (state === "down") return this._stop_down({ unit });
      this._downing(unit);
    },
    _file_size(size = 0) {
      let k = size / 1024;
      return k < 900
        ? this._deal_size(Math.round(k * 10) / 10) + "Kb"
        : this._deal_size(Math.round((k / 1024) * 10) / 10) + "Mb";
    },
    _deal_size(size, n = 1) {
      let s = size.toString();
      return /\./.test(s)
        ? s.replace(new RegExp("(?<=\\.\\d{" + n + "}).*"), "")
        : s + "." + "".padEnd(n, "0");
    }
  }
};
</script>

<style lang="scss" scoped>
.downing-unit {
  padding: 8px 0 12px;
  img {
    display: block;
    max-width: 90%;
    margin: 20px auto;
    border-radius: 5px;
  }
  p {
    display: flex;
    padding: 8px 50px;
    height: 20px;
    &.assets {
      span {
        color: #336;
        &:nth-child(1) {
          width: 180px;
        }
        &:nth-child(3) {
          &.error {
            color: #f00;
          }
          &.down {
            color: #09f;
          }
          &.stop {
            color: #999;
          }
          &.await {
            color: #60f;
          }
        }
      }
      button {
        margin-left: 36px;
        width: 20px;
        background-size: 16px;
        background-position: center;
        background-repeat: no-repeat;
        &.state {
          margin-left: auto;
          &.error {
            background-image: url(~assets/img/reload.svg);
          }
          &.down {
            background-image: url(~assets/img/stop.svg);
          }
          &.stop {
            background-image: url(~assets/img/start.svg);
          }
          &.await {
            background-image: url(~assets/img/pause.svg);
          }
        }
        &.del {
          background-image: url(~assets/img/delete.svg);
        }
      }
    }
    &.load {
      span,
      svg {
        display: block;
      }
      span {
        text-align: right;
        line-height: 20px;
        font-size: 15px;
        &:nth-of-type(1) {
          width: 84px;
        }
        &:nth-of-type(2) {
          flex: 1;
        }
        &:nth-of-type(3) {
          width: 60px;
        }
      }
    }
  }
}
</style>
