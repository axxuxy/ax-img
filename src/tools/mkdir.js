import path from "path";
import fs from "fs";

function dir(my_path, root_path) {
  if (fs.existsSync(my_path)) return true;
  if (my_path === root_path) return false;
  if (!dir(path.resolve(my_path, "../"), root_path)) return false;
  try {
    fs.mkdirSync(my_path);
  } catch {
    return false;
  }
  return true;
}

export default function(my_path) {
  return dir(path.resolve(my_path), path.resolve(my_path, "/"));
}
