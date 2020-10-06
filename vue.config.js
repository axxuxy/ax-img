const path = require("path");
function resolve(_path) {
  return path.resolve(_path);
}

const outPath = resolve("app");

module.exports = {
  pluginOptions: {

    // electron打包配置
    electronBuilder: {
      nodeIntegration: true,
      outputDir: outPath,
      builderOptions: {
        win: {
          target: [
            {
              target: "zip",
              arch: ["x64"]
            },
            {
              target: "nsis",
              arch: ["x64"]
            }
          ],
          icon: resolve("icon.png")
        },
        extraFiles: ["pack.json","readme.txt"]
      }
    }
  },
  
  // webpack路径设置
  configureWebpack: {
    resolve: {
      alias: {
        components: resolve("src/components"),
        assets: resolve("src/assets"),
        router: resolve("src/router"),
        store: resolve("src/store"),
        views: resolve("src/views"),
        tools: resolve("src/tools")
      }
    }
  }
}