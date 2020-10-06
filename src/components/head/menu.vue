<template>
  <div class="v-menu">
    <div class="rating">
      <p>安全等级设置</p>
      <ul>
        <li v-for="(website, key) in websites" :key="key">
          <span class="website" v-text="key + '：'"></span>
          <select v-model="website.rating" @change="_rating($event, key)">
            <option
              v-for="(option, index) in ratings"
              :key="index"
              :value="option.value"
              v-text="option.name"
            ></option>
          </select>
        </li>
      </ul>
    </div>
    <div class="dir">
      <p>默认下载文件夹设置</p>
      <ul>
        <li v-for="(website, key) in websites" :key="key">
          <p>
            <span class="website" v-text="key + '：'"></span>
            <button @click="_dir(website, key)">选择文件夹</button>
            <button @click="_dir(website, key)">打开文件夹</button>
            <button @click="_dir(website, key, null)">重置</button>
          </p>
          <p><span>默认下载目录为：</span><span v-text="website.dir"></span></p>
          <p>
            <span>输入目录：</span>
            <span contenteditable="true" @keydown="_input_keydown"></span>
            <button @click="_input_dir($event, website, key)">确认</button>
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import mkdir from "tools/mkdir";

import { createNamespacedHelpers } from "vuex";
const { mapState } = createNamespacedHelpers("website");

import fs from "fs";
import path from "path";
import { remote } from "electron";
const { dialog } = remote;

export default {
  name: "v-menu",
  data() {
    return {
      rating: "",
      ratings: [
        {
          name: "全部",
          value: ""
        },
        {
          name: "安全",
          value: "rating:s"
        },
        {
          name: "非安全",
          value: "-rating:s"
        },
        {
          name: "可疑",
          value: "rating:q"
        },
        {
          name: "非可疑",
          value: "-rating:q"
        },
        {
          name: "暴露",
          value: "rating:e"
        },
        {
          name: "非暴露",
          value: "-rating:e"
        }
      ]
    };
  },
  computed: {
    ...mapState(["websites"])
  },
  methods: {
    _rating(ev, website) {
      window.localStorage.setItem(website + "-rating", ev.target.value);
    },
    _set_dir(website, key, dir) {
      website.dir = dir;
      window.localStorage.setItem(key + "-dir", dir);
    },
    _dir(website, key = "", dir) {
      if (dir === null)
        return this._set_dir(website, key, path.resolve("./img", key));
      if (dir) {
        dir = path.resolve(dir);
        if (website.dir === dir) return;
        if (fs.existsSync(dir)) return this._set_dir(website, key, dir);
        return this.$confirm(
          "指定的目录 " + dir + " 不存在,是否尝试创建该目录",
          "目录不存在",
          {
            confirmButtonText: "创建",
            cancelButtonText: "取消",
            type: "warning"
          }
        )
          .then(() => {
            if (!mkdir(dir))
              return this.$message.error("创建目录 " + dir + " 失败");
            this._set_dir(website, key, dir);
          })
          .catch(() => null);
      }
      let text = "选择" + key + "默认下载目录";
      dialog
        .showOpenDialog({
          title: text,
          defaultPath: website.dir || path.resolve("./"),
          properties: ["openDirectory", "createDirectory"]
        })
        .then(res => {
          let dir = res.filePaths[0];
          if (dir && dir !== website.dir) {
            website.dir = dir;
            window.localStorage.setItem(key + "-dir", dir);
          }
        })
        .catch(() => {
          this.$message({
            message: text + "错误"
          });
        });
    },
    _input_dir(ev, website, key) {
      let dir = ev.target.previousElementSibling.innerText;
      if (!dir) return this.$message({ message: "请输入目录" });
      this._dir(website, key, dir);
    },
    _input_keydown(ev) {
      if (ev.keyCode !== 13) return;
      ev.preventDefault();
      this.$message({
        message: "目录不能包含换行",
        type: "warning"
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.v-menu {
  position: fixed;
  top: 48px;
  right: 0;
  max-height: calc(100% - 48px);
  padding: 18px 12px;
  box-sizing: border-box;
  background-color: #0009;
  box-shadow: -2px 2px 2px 2px #000;
  color: #ffffff;
  cursor: auto;
  overflow: auto;
  & > div {
    background-color: #9999;
    border-radius: 5px;
  }
  .rating,
  .dir {
    width: 100%;
    padding: 8px 18px 12px;
    box-sizing: border-box;
    font: 18px/32px "微软雅黑";
    margin-bottom: 12px;
    transition: all 0.5s;
    &:hover {
      box-shadow: 0 0 3px 3px #ccc;
    }
    & > p {
      padding: 15px;
      font-size: 21px;
    }
    .website {
      color: #6cf;
      font-size: 24px;
    }
    ul {
      li {
        padding: 2px 0;
        border-radius: 5px;
        transition: all 0.36s;
        &:hover {
          background-color: #0001;
          box-shadow: 0 0 2px 3px #999;
        }
        input {
          text-align: left;
          text-align-last: left;
        }
      }
    }
  }
  .rating {
    ul {
      text-align: justify;
      li {
        display: inline-block;
        padding: 3px 15px;
        &,
        select {
          text-align: center;
          text-align-last: center;
        }
        span,
        select {
          display: inline-block;
          vertical-align: middle;
        }
        select,
        button {
          padding: 0 5%;
          width: 160px;
          height: 32px;
          font: 16px/32px "微软雅黑";
          background-color: #eee;
          cursor: pointer;
          &:hover {
            background-color: #fff;
          }
        }
      }
    }
  }
  .dir {
    ul > li {
      margin-top: 5px;
      background-color: #0003;
      padding: 10px 18px;
      p {
        padding: 5px 0;
        span,
        button {
          display: inline-block;
          vertical-align: top;
        }
        button {
          height: 32px;
          padding: 0 18px;
          font-size: 15px;
        }
        &:nth-child(1) {
          display: flex;
          span {
            flex: 1;
          }
          button {
            margin-right: 18px;
          }
        }
        &:nth-child(3) {
          display: flex;
          span {
            &:nth-child(2) {
              flex: 1;
              min-width: 100px;
              height: 32px;
              margin-right: 18px;
              padding: 0 12px;
              border: 1px solid #ccc;
              border-radius: 5px;
              background-color: #fff;
              font-size: 16px;
              color: #036;
              outline: none;
            }
          }
        }
      }
    }
  }
}
</style>
