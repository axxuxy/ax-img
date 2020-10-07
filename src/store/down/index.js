import fs from "fs";
import path from "path";
import downimg from "tools/down";
import move from "tools/moveFile";

const down = [];

window.addEventListener("close", () => {
  if (down.length > 0) fs.writeFileSync("./down.json", JSON.stringify(down));
});

function hasImg(unit) {
  if (!unit) return false;
  let path = unit.path;
  if (!path) return false;
  if (fs.existsSync(path)) return path;
  return false;
}

export default {
  namespaced: true,
  state: {
    down,
    downing: new Set(),
    downed: [],
    down_count: 0,
    max_down: 5,
    message: null
  },
  getters: {
    downing_count: state => state.down.length,
    message: state => state.message
  },
  mutations: {
    adddown({ down }, unit) {
      down.unshift(unit);
    },
    redown({ down }, unit) {
      let index = down.findIndex(val => val === unit);
      if (index === -1) return;
      down.splice(index, 1);
    },
    adddowning({ downing }, unit) {
      downing.add(unit);
    },
    redowning({ downing }, unit) {
      downing.delete(unit);
    },
    adddowned({ downed }, unit) {
      downed.unshift(unit);
    },
    redowned({ downed }, unit) {
      let index = downed.findIndex(val => {
        return val === unit;
      });
      if (index >= 0) downed.splice(index, 1);
    },
    down_count(state, add) {
      add ? state.down_count++ : state.down_count--;
    },
    message(state, message) {
      state.message = message;
    }
  },
  actions: {
    // 添加下载任务，对数据进行处理后加入下载队列
    _down: {
      root: true,
      handler({ commit, rootState, state, dispatch }, { post, type, website }) {
        return new Promise((res, rej) => {
          try {
            let { down, downed } = state,
              { id } = post;
            let key = website + "-" + id + (type ? "-" + type : "");

            if (down.find(({ name }) => name === key)) return res({ type: 1 });
            let imgPath = hasImg(downed.find(({ name }) => name === key));
            if (imgPath) return res({ type: 2, path: imgPath });
            let localImg = window.localStorage.getItem(key);
            if (localImg) {
              let unit;
              try {
                unit = JSON.parse(localImg);
              } catch {
                unit = false;
              }
              let imgPath = hasImg(unit);
              if (imgPath) {
                unit.name = key;
                commit("adddowned", unit);
                return res({ type: 2, path: imgPath });
              } else window.localStorage.removeItem(key);
            }

            let url, ext, size, width, height;
            switch (type) {
              case "jpeg":
                url = post.jpeg_url;
                ext = "jpg";
                size = post.jpeg_file_size;
                width = post.width;
                height = post.height;
                break;
              case "sample":
                url = post.sample_url;
                ext = "jpg";
                size = post.sample_file_size;
                width = post.sample_width;
                height = post.sample_height;
                break;
              default:
                url = post.file_url;
                ext = post.file_ext || /[^.]+$/.exec(url);
                size = post.file_size;
                width = post.width;
                height = post.height;
                break;
            }
            let creat = new Date().getTime();
            let unit = {
              name: key,
              id,
              website,
              type,
              url,
              size,
              ext,
              width,
              height,
              creat,
              creat_satrt: rootState.start,
              loadsize: 0,
              loading: 0,
              state: "await"
            };

            commit("adddown", unit);

            dispatch("_downing", unit);

            res({ type: 10 });
          } catch {
            rej();
          }
        });
      }
    },
    // 下载队列，判断下载是否达阈值，是则加入等待队列，否则直接下载
    _downing({ state, dispatch, commit }, unit) {
      let { down_count, max_down } = state;
      if (down_count < max_down) {
        commit("down_count", true);
        dispatch("_start_down", unit);
        return;
      }
      unit.state = "await";
      commit("adddowning", unit);
    },
    // 开始下载
    _start_down({ rootState, dispatch, commit }, unit) {
      unit.state = "down";
      unit.loading = unit.loadsize = 0;
      let req = (unit.request = downimg({
        url: unit.url,
        load: ({ file_size, loadsize }) => {
          unit.loadsize = loadsize;
          let { size } = unit;
          if (size !== file_size) unit.size = file_size;
          unit.loading = Math.floor((loadsize / file_size) * 10000) / 10000;
        }
      }));
      req
        .then(cache_path => {
          let { name, ext, website } = unit;
          let dir = rootState.website.websites[website].dir || "img/" + website;
          let img_path = path.resolve(dir, name + "." + ext);
          move(cache_path, img_path, { cover: true, creatDir: true })
            .then(() => {
              dispatch("_down_finish", {
                unit,
                path: img_path
              });
            })
            .catch(error => {
              unit.state = "error";
              if (error === 3) return;
              commit("message", {
                message: unit.name + " 缓存的图片数据处理失败",
                type: "error"
              });
            });
          dispatch("_next_down");
        })
        .catch(error => {
          dispatch("_next_down");
          let message;
          switch (error) {
            case 1:
              message = " 图片下载地址未传入";
              break;
            case 2:
              message = " 图片下载url协议不正确";
              break;
            case 3:
              message = " 图片下载连接超时";
              break;
            case 4:
              message = unit.name + " 图片发送下载请求错误";
              break;
            case 5:
              return;
            default:
              if (typeof error === "number") {
                message = " 请求返回状态码不正确 状态码：" + error;
                break;
              }
              message = " 请求发生异常错误";
              break;
          }
          unit.state = "error";
          commit("message", {
            message,
            type: "error"
          });
        });
    },
    // 下载成功后把下载单元移入完成单元
    _down_finish({ commit, rootState }, { unit, path }) {
      let {
        name: key,
        id,
        website,
        type,
        url,
        size,
        ext,
        width,
        height,
        creat,
        creat_satrt
      } = unit;
      let save = {
        path,
        downed: new Date().getTime(),
        downed_stare: rootState.start,
        id,
        website,
        type,
        url,
        size,
        ext,
        width,
        height,
        creat,
        creat_satrt
      };
      window.localStorage.setItem(key, JSON.stringify(save));
      commit("redown", unit);
      save.name = name;
      save.show=false;
      commit("adddowned", save);
    },
    // 下一个下载，下载完成后停止正在下载的任务后运行
    _next_down({ state, commit, dispatch }) {
      let { downing } = state;
      let unit = downing.values().next().value;
      if (!unit) return commit("down_count");
      commit("redowning", unit);
      dispatch("_start_down", unit);
    },
    // 停止或暂停任务，is_delete为真则直接商储任务
    _stop_down({ commit }, { unit, is_delete }) {
      if (unit.state === "down") {
        unit.request.abort();
        // dispatch("_next_down");
      } else {
        commit("redowning", unit);
      }
      if (is_delete) return commit("redown", unit);
      unit.state = "stop";
    },
    // 重新下载图片
    _re_down({ commit, dispatch, rootState }, { unit, key }) {
      Object.assign(unit, {
        creat: new Date().getTime(),
        creat_satrt: rootState.satrt,
        name: key,
        loadsize: 0,
        loading: 0
      });
      commit("redowned", { unit, key });
      commit("adddown", unit);
      dispatch("_downing", unit);
    }
  }
};
