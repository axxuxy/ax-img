<template>
  <div class="post">
    <div class="mess">
      <h4 v-text="title"></h4>
      <ul>
        <li><span>创建时间：</span><span v-text="create_time"></span></li>
        <li><span>创建者：</span><span v-text="post.author"></span></li>
        <li><span>安全等级：</span><span v-text="rating"></span></li>
        <li v-if="source" class="link">
          <span>图片来源：</span
          ><span
            :title="post.source"
            v-text="post.source"
            @click="_source"
          ></span>
        </li>
        <li><span>图片尺寸：</span><span v-text="size"></span></li>
        <li class="link" @click="_down()">
          <span @click.stop>原图下载：</span><span v-text="file_size"></span
          ><span v-text="ext + '格式'"></span>
        </li>
        <li v-if="jpeg" class="link" @click="_down('jpeg')">
          <span @click.stop>大图下载：</span><span v-text="jpeg"></span>
        </li>
        <li v-if="sample" class="link" @click="_down('sample')">
          <span @click.stop>样图下载：</span
          ><span v-text="sample.file_size"></span
          ><span v-text="sample.size"></span>
        </li>
        <li class="tags">
          <p>标签列表</p>
          <ul class="tags">
            <li v-for="tags in tags_lists" :key="tags.title">
              <p v-text="tags.title"></p>
              <ul>
                <li
                  v-for="(tag_obj, index) in tags.tags"
                  :key="index"
                  @click="_open_tag(tag_obj.tag)"
                >
                  <span v-text="tag_obj.tag"></span
                  ><span v-text="tag_obj.count"></span>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="img" @click="_close">
      <v-img
        :width="post.sample_width"
        :height="post.sample_height"
        :src="post.sample_url"
        :clickStop="true"
        :clickReload="true"
      />
      <i class="close"></i>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { createNamespacedHelpers } from "vuex";
const { mapState } = createNamespacedHelpers("website");

import child_process from "child_process";

import img from "components/tools/img";

import get_tag from "tools/get";

export default {
  name: "",
  props: {
    post: Object,
    website: String
  },
  data() {
    return {
      tags_lists: []
    };
  },
  computed: {
    ...mapState(["websites"]),
    ext() {
      let { post } = this;
      return post.file_ext || /[^.]+$/.exec(post.file_url)[0];
    },
    url() {
      let { website, websites } = this;
      return websites[website].url;
    },
    tag_url() {
      return this.url + "tag.json";
    },
    title() {
      let {
        website,
        post: { id }
      } = this;
      return website + "-" + id;
    },
    jpeg() {
      let post = this.post;
      let jpeg_file_size = post.jpeg_file_size;
      if (
        !jpeg_file_size ||
        jpeg_file_size === post.file_size ||
        post.file_ext === "jpg" ||
        post.file_ext === "jpeg" ||
        post.jpeg_url === post.file_url
      )
        return false;
      return this._file_size(jpeg_file_size);
    },
    sample() {
      let post = this.post;
      let { sample_file_size } = post;
      if (
        !sample_file_size ||
        sample_file_size === post.jpeg_file_size ||
        sample_file_size === post.file_size
      )
        return false;
      return {
        file_size: this._file_size(sample_file_size),
        size: post.sample_width + "✖" + post.sample_height
      };
    },
    file_size() {
      return this._file_size(this.post.file_size);
    },
    create_time() {
      this.post.created_at;
      let date = new Date();
      return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date
        .getDate()
        .toString()
        .padStart(2, "0")} ${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${date
        .getSeconds()
        .toString()
        .padStart(2, "0")}`;
    },
    source() {
      let source = this.post.source;
      if (!source) return false;
      if (/https?:\/\/i.pximg.net\/.*/.test(source)) {
        source = `https://www.pixiv.net/artworks/${/\d*(?=_[^_]*?$)/.exec(
          source
        )}`;
      }
      return source;
    },
    size() {
      let { width, height } = this.post;
      return `${width} ✖ ${height}`;
    },
    rating() {
      let rating;
      switch (this.post.rating) {
        case "q":
          rating = "未确定";
          break;
        case "s":
          rating = "安全";
          break;
        case "e":
          rating = "危险";
          break;
        default:
          rating = "未确定";
          break;
      }
      return rating;
    },
    tags() {
      return this.post.tags.split(" ");
    }
  },
  components: {"v-img":img},
  methods: {
    _file_size(size) {
      let k = size / 1024;
      if (k < 900) return Math.round(k * 10) / 10 + "KB";
      let m = k / 1024;
      return Math.round(m * 10) / 10 + "MB";
    },
    _get_tags(tag) {
      let key = this.website + "-" + tag;
      let tag_obj = window.sessionStorage.getItem(key);
      if (tag_obj) return this._push_tag(tag, JSON.parse(tag_obj));
      get_tag(`${this.tag_url}?name=${tag}&limit=0`)
        .then(data => {
          data.forEach(obj => {
            if (obj.name === tag) this._push_tag(tag, obj);
            window.sessionStorage.setItem(key, JSON.stringify(obj));
          });
        })
        .catch(error => {
          let mess;
          switch (error) {
            case 1:
              mess = "信息错误";
              break;
            case 2:
              mess = "超时";
              break;
            default:
              mess = "";
              break;
          }
          this.$message({
            message: "请求标签：" + tag + mess,
            duration: 1000
          });
        });
    },
    _push_tag(tag, { type, count }) {
      let key,
        tags_lists = this.tags_lists;
      switch (type) {
        case 0:
          key = "常规";
          break;
        case 1:
          key = "艺术家";
          break;
        case 3:
          key = "版权";
          break;
        case 4:
          key = "角色";
          break;
        case 5:
          key = "画风";
          break;
        case 6:
          key = "团体";
          break;
        default:
          key = "常规";
          break;
      }
      let tags = tags_lists.find(val => val.title === key);
      tag = tag.replace("_", " ");
      let obj = { tag, count };
      if (tags) return tags.tags.push(obj);
      tags_lists.push({
        title: key,
        tags: [obj]
      });
    },
    _open_tag(tag) {
      let path = `/posts/${this.website}/${tag.replace(" ", "_")}`;
      if (path === this.$route.path) return;
      this.$router.push({ path });
    },
    _close() {
      this.$emit("close");
    },
    _source() {
      let source = this.source;
      if (!/https?:\/\/([^.|/]+\.)+[^.|/]+/.test(source))
        source = "https://baidu.com/s?wd=" + encodeURIComponent(source);
      child_process.exec("start " + source);
    },
    _down(type) {
      let { website, post } = this;
      this.$store
        .dispatch("_down", { type, website, post })
        .then(res => {
          let message;
          switch (res.type) {
            case 1:
              message = "已存在相同的图片在下载";
              break;
            case 2:
              message = "图片已下载";
              break;
            case 10:
              message = "添加图片下载任务成功";
              break;
            default:
              return;
          }
          message = `${website}-${post.id}${type ? "-" + type : ""} ${message}`;
          this.$message({ message });
        })
        .catch(() => {
          this.$message.error("添加图片下载任务发生错误");
        });
    }
  },
  created() {
    this.tags.forEach(tag => {
      this._get_tags(tag);
    });
  }
};
</script>

<style lang="scss" scoped>
.post {
  display: flex;
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: #0006;
  z-index: 80;
  .mess,
  .img {
    height: 100%;
  }
  .mess {
    width: 18%;
    min-width: 320px;
    background-color: #ddd;
    overflow: auto;
    h4 {
      padding: 15px 0;
      font-size: 18px;
      text-align: center;
      width: 100%;
    }
    & > ul > li {
      display: flex;
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
      background-color: #eee;
      white-space: nowrap;
      &:nth-child(2n) {
        background-color: #ddd;
      }
      &:nth-child(2n + 1) {
        background-color: #ccc;
      }
      & > span {
        color: #666;
        &:nth-child(1) {
          width: 100px;
          text-align: justify;
          text-align-last: justify;
        }
        &:nth-child(2) {
          flex: 1;
          max-width: calc(100% - 100px);
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      &.link {
        transition: all 0.36s;
        &:hover {
          background-color: #bbb;
        }
        span {
          cursor: pointer;
          &:nth-child(1) {
            cursor: default;
          }
          &:nth-child(2) {
            color: #339;
          }
          &:nth-child(3) {
            width: 100px;
            color: #66c;
          }
        }
      }
      &.tags {
        display: block;
        padding: 0 0 24px;
        & > p {
          padding: 16px 0;
          text-align: center;
          font-size: 18px;
          background-color: #eee;
          color: #234;
        }
        li {
          display: block;
          padding: 0;
          p {
            padding: 12px 24px;
            background-color: #aaa;
            color: #fff;
          }
          ul {
            li {
              display: flex;
              padding: 8px 24px 8px;
              background-color: #eee;
              cursor: pointer;
              transition: all 0.3s;
              &:nth-child(2n) {
                background-color: #ddd;
              }
              &:hover {
                background-color: #ccc;
                span {
                  color: #06f;
                }
              }
              span {
                display: block;
                text-align-last: left;
                color: #119;
                &:nth-child(1) {
                  width: auto;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }
                &:nth-child(2) {
                  padding-left: 24px;
                  flex: 1;
                  color: #16f;
                }
              }
            }
          }
        }
      }
    }
  }
  .img {
    position: relative;
    flex: 1;
    display: flex;
    img {
      display: block;
      width: auto;
      height: auto;
      max-width: calc(100% - 168px);
      max-height: calc(100% - 168px);
      margin: auto;
    }
    .close {
      position: absolute;
      right: 16px;
      top: 16px;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background-color: #000;
      opacity: 0.36;
      transition: all 0.3s;
      &::before,
      &::after {
        content: "";
        display: block;
        position: absolute;
        top: 50%;
        left: 50%;
        border-radius: 3px;
        height: 6px;
        width: 84%;
        background-color: #ccc;
      }
      &::before {
        transform: translate(-50%, -50%) rotate(45deg);
      }
      &::after {
        transform: translate(-50%, -50%) rotate(-45deg);
      }
      &:hover {
        opacity: 0.8;
        box-shadow: 0 0 5px 2px #000;
      }
    }
  }
}
</style>
