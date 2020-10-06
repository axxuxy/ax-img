<template>
  <div id="app">
    <v-header></v-header>
    <keep-alive exclude="Down">
      <router-view class="router" />
    </keep-alive>
  </div>
</template>
<script type="text/ecmascript-6">
import header from "components/head";
import fs from "fs";
import child_process from "child_process";
import path from "path";

const hostsPath = "C:/Windows/System32/drivers/etc/hosts";

export default {
  name: "app",
  components: {
    "v-header": header
  },
  methods: {
    _nothosts() {
      this.$confirm(
        "由于Y站域名在国内解析不到正确的域名，可能无法进行正常的访问Y站站点，是否打开修改hosts教程",
        "hosts文件配置",
        {
          confirmButtonText: "修改",
          cancelButtonText: "忽略",
          type: "warning"
        }
      )
        .then(() => {
          child_process.exec("notepad " + hostsPath);
          setTimeout(() => {
            child_process.exec("notepad " + path.resolve("./readme.txt"));
          }, 1000);
        })
        .catch(() => {
          this.$alert(
            "若是无法使用Y站可以前往本程序目录：\n" +
              __dirname +
              "\n查看readme.txt修改hosts教程",
            "确认",
            {
              confirmButtonText: "确定"
            }
          )
            .then(() => null)
            .catch(() => null);
        });
    },
    _hosts() {
      if (window.localStorage.getItem("hosts")) return;
      window.localStorage.setItem("hosts", true);
      fs.readFile(hostsPath, (error, data) => {
        if (error) return this._nothosts();
        let nothosts,
          hosts = data.toString();
        [
          / *198\.98\.54\.92 *yande\.re/,
          / *198\.98\.54\.92 *assets\.yande\.re/,
          / *198\.98\.54\.92 *files\.yande\.re/
        ].forEach(re => {
          if (!re.test(hosts)) return (nothosts = true);
        });
        if (nothosts) this._nothosts();
      });
    }
  },
  created() {
    this._hosts();
  }
};
</script>
<style lang="scss">
@import "~assets/sass/font";
@import url(~assets/css/index.css);
#app {
  height: 100%;
  & > .router {
    width: 100%;
    height: calc(100% - 48px);
    overflow: auto;
  }
}
</style>
