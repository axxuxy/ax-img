# ax-img

本人写的Y站、K站集图器，欢迎收藏一波。话说最近在找工作有人要吗？(●'◡'●)。简历地址 https://axxu.xyz/my。

使用框架electron vue element-ui

使用了插件 vue-cli-plugin-electron-builder 来方便开发

如果你要自行编译的话要安装 nodejs 编译时要能连接外网，满足条件的话可以使用 npm 运行编译：

    npm init
    npm run electron:build
安装项目依赖，可能碰到 electron 无法安装，emm 网上有相关教程自行解决。end
若是喜欢用 yarn 的话使用

    yarn init
    yarn run electron:build

***

## 用途

用来浏览下载K站、Y站图片，并对下载的图片进行管理。  

支持选择浏览图片安全级别和下载目录设置，通过帖子的标签搜图。

手动输入标签和收藏标签功能待开发，后续持续优化中，暂时告一段落，先找工作。要吃土了 /(ㄒoㄒ)/~~ 。

***

## 目录结构说明

vue.config.js--包含 electron 程序打包配置和 vue 的 webpack 资源路径设置。  

icon.png------为打包的图标设置。  

pack.json------为程序站点（Y站和K站）配置。

src-------------代码目录，详细见src目录下[README.md](./src/README.md)的说明。

public---------静态文件设置。

***

## 感言

嗯，做的很简陋，开发期间也碰到很多问题，不过还是慢慢爬过来了。打算找工作，边做边学，一个人自娱自乐搞还是不行的，要吃土的。。。继续努力吧。