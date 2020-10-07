<template>
  <div class="downed-unit">
    <p>
      <span v-text="name"></span
      ><span v-text="'创建时间：' + downed_time"></span
      ><span v-text="'文件大小：' + file_size"></span><span>尺寸：</span
      ><span v-text="size"></span>
    </p>
    <p class="button">
      <button @click="_redown">重新下载</button>
      <button
        @click="unit.show = !show"
        v-text="show ? '隐藏图片' : '显示图片'"
      ></button>
      <button title="在文件夹中打开" @click="_openFile">打开文件</button>
      <button @click="_reFile">删除</button>
    </p>
    <transition name="img">
      <div class="img" v-if="show">
        <img :src="'atom://' + path" :width="width" :height="height" />
      </div>
    </transition>
  </div>
</template>

<script type="text/ecmascript-6">
import child_process from "child_process";
import fs from "fs";

import { createNamespacedHelpers } from "vuex";

const { mapMutations, mapActions } = createNamespacedHelpers("down");

export default {
  name: "v-downed",
  props: {
    unit: Object
  },
  computed: {
    path() {
      return this.unit.path;
    },
    name() {
      let { website, type, id } = this.unit;
      return website + "-" + id + (type ? "-" + type : "");
    },
    show() {
      return this.unit.show;
    },
    downed_time() {
      return this._time(this.unit.downed);
    },
    file_size() {
      let size = this.unit.size / 1024;
      return size < 900
        ? Math.round(size) + "Kb"
        : Math.round(size / 1024) + "Mb";
    },
    width() {
      return this.unit.width;
    },
    height() {
      return this.unit.height;
    },
    size() {
      let { width, height } = this;
      return width + " ✖ " + height;
    }
  },
  methods: {
    ...mapMutations(["redowned"]),
    ...mapActions(["_re_down"]),
    _time(time) {
      let date = new Date(time);
      let y = date.getFullYear().toString(),
        m = (date.getMonth() + 1).toString(),
        d = date.getDate().toString(),
        h = date.getHours().toString(),
        mi = date.getMinutes().toString();
      return `${y}年 ${m.padStart(2, "0")}月 ${d.padStart(
        2,
        "0"
      )}日 ${h.padStart(2, "0")}:${mi.padStart(2, "0")}`;
    },
    _openFile() {
      child_process.exec("explorer /select," + this.path);
    },
    _reFile() {
      let { path, name, unit } = this;
      if (fs.existsSync(path)) fs.unlinkSync(path);
      this.redowned(unit);
      window.localStorage.removeItem(name);
    },
    _redown() {
      let { unit, name } = this;
      this._re_down({ unit, key: name });
    }
  }
};
</script>

<style lang="scss" scoped>
.downed-unit {
  padding: 6px 50px;
  p {
    padding: 8px 0;
    display: flex;
    span {
      display: block;
      &:nth-child(1) {
        width: 180px;
      }
      &:nth-child(2) {
        flex: 1;
      }
      &:nth-child(3) {
        width: 160px;
      }
      &:nth-child(4) {
        width: 50px;
      }
      &:nth-child(5) {
        width: 100px;
        text-align: right;
      }
    }
    &.button {
      padding-top: 2px;
      justify-content: space-between;
      overflow: hidden;
      opacity: 1;
    }
    button {
      width: 136px;
      height: 32px;
      font-size: 16px;
      color: #366;
      &:nth-child(1) {
        background-color: #39f;
        color: #fff;
        &:hover {
          background-color: #36f;
        }
        &:active {
          background-color: #366;
        }
      }
      &:nth-child(4) {
        background-color: #f33;
        color: #fff;
        &:hover {
          background-color: #d03;
        }
        &:active {
          background-color: #f66;
        }
      }
    }
  }
  .img {
    background-color: #0009;
    padding: 0px 15px;
    border-radius: 5px;
    overflow: hidden;
    &.img-enter-active,
    &.img-leave-active {
      transition: all 1s;
      max-height: 800px;
    }
    &.img-enter,
    &.img-leave-to {
      opacity: 0;
      max-height: 0;
      margin: 0;
      padding: 0 15px;
    }
    img {
      display: block;
      max-width: 100%;
      max-height: 800px;
      width: auto;
      height: auto;
      margin: auto;
      max-height: 800px;
      padding: 15px;
    }
  }
}
</style>
