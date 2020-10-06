import http from "http";
import https from "https";
import path from "path";
import fs from "fs";

import mkdir from "tools/mkdir";

const cache_img = "cache_img";

export default function({ url, load }) {
  let request;
  let pro = new Promise((resolve, rej) => {
    if (!url)
      return setTimeout(() => {
        rej(1);
      }, 0);

    let protocol;
    if (/https:\/\/[^.|/]+(\.[^.|/]+)+/.test(url)) {
      protocol = https;
    } else if (/http:\/\/[^.|/]+(\.[^.|/]+)+/.test(url)) {
      protocol = http;
    } else
      return setTimeout(() => {
        rej(2);
      }, 0);

    let req = (request = protocol.request(url, { timeout: 30000 }));

    req.on("abort", () => {
      rej(5);
    });

    req.on("timeout", () => {
      rej(3);
      req.abort();
    });

    req.on("error", () => {
      if (req.aborted) return;
      rej(4);
    });

    req.on("response", res => {
      let status = res.statusCode;
      if (status !== 200) return rej(status);

      if (load) {
        let loading,
          loadObj = {
            file_size: parseInt(res.headers["content-length"]),
            loadsize: 0
          };
        let t = setInterval(() => {
          let loadsize = loadObj.loadsize;
          if (loading === loadsize) return;
          loading = loadsize;
          load(loadObj);
        }, 200);
        res.on("data", buffer => {
          loadObj.loadsize += buffer.length;
        });
        res.on("close", () => {
          load(loadObj);
          clearInterval(t);
        });
      }

      mkdir(cache_img);
      let random = (Math.floor(Math.random() * 10000) + "").padStart(4, "0");
      let file_name = `${new Date().getTime()} ${random}`;
      let img_path = path.resolve(cache_img, file_name);
      let write = fs.createWriteStream(img_path);

      res.on("error", () => {
        rej(4);
        write.destroy();
        if (fs.existsSync(img_path)) fs.unlink(img_path, () => null);
      });

      write.on("close", () => {
        if (write.writableFinished) return resolve(img_path);
        rej(4);
        if (fs.existsSync(img_path)) fs.unlink(img_path, () => null);
      });

      res.pipe(write);
    });
    req.end();
  });
  pro.abort = function() {
    if (request) request.abort();
  };
  return pro;
}
