import { remote } from "electron";

const { net } = remote;

export default function(url, load) {
  return new Promise((resolve, reject) => {
    let req = net.request({
      url,
      useSessionCookies: true
    });
    req.on("error", () => {
      reject(1);
    });

    let timeout = setTimeout(() => {
      reject(2);
      req.abort();
    }, 10000);

    req.on("redirect", () => {
      req.followRedirect();
    });

    req.on("response", res => {
      clearTimeout(timeout);

      let buffer = [],
        file_size,
        loadObj,
        interval,
        count = 0,
        t;

      t = setInterval(() => {
        if (++interval > 15) req.abort();
        if (!load || count === loadObj.count) return;
        count = loadObj.count;
        load(loadObj);
      }, 200);

      if (load) {
        file_size = res.headers["content-length"];
        if (file_size) file_size = parseInt(file_size);
        loadObj = { file_size, loading: 0, count: 0 };
      }

      res.on("data", buff => {
        interval = 0;
        buffer.push(buff);
        if (!load) return;
        loadObj.loading += buff.length;
        loadObj.count++;
      });
      res.on("end", () => {
        if (t) clearInterval(t);
        try {
          let data = JSON.parse(Buffer.concat(buffer).toString());
          resolve(data);
        } catch {
          reject(3);
        }
      });
      res.on("close", () => {
        if (t) clearInterval(t);
        let data = Buffer.concat(buffer).toString();
        try {
          let d = JSON.parse(data);
          resolve(d);
        } catch {
          reject(2);
        }
      });
    });

    req.end();
  });
}
