import fs from "fs";
import path from "path";
import mkdir from "tools/mkdir";

export default function(oldPath, newPath, { creatDir, cover }) {
  return new Promise((resolve, rej) => {
    // 检查目标文件地址是否存在
    if (!fs.existsSync(oldPath)) return rej(1);
    // 检查目的文件地址是否存在相同文件，并且是否覆盖写入
    if (fs.existsSync(newPath) && !cover) return rej(4);
    // 检查目的文件目录是否存在
    let fileDir = path.resolve(newPath, "../");
    if (!fs.existsSync(fileDir)) {
      // 目的文件夹是否存在，是否创建目录
      if (!creatDir) return rej(5);
      // 创建成功还是失败
      if (!mkdir(fileDir)) return rej(6);
    }

    // 目的文件地址和目标文件是否在相同盘符，是则改名
    if (path.resolve(oldPath, "/") === path.resolve(newPath, "/"))
      return fs.rename(oldPath, newPath, error => {
        if (error) return rej(2);
        resolve();
      });
    // 否则读取文件写入目的地址
    let r = fs.createReadStream(oldPath),
      w = fs.createWriteStream(newPath);
    w.on("close", () => {
      if (!w.writableFinished) return rej(2);
      fs.unlink(oldPath, error => (error ? rej(3) : resolve()));
    });
    r.pipe(w);
  });
}

/*
错误返回值含义：
    1：要移动的文件不存在；
    2：移动文件发生错误；
    3：创建新文件成功但是删除旧文件失败；
    4：要移动到的目的地有相同的文件；
    5：要移动到的目录不存在；
    5：要移动到的目录不存在并且创建失败；
*/
