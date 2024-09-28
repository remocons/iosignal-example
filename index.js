import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";
import { Server } from "iosignal";
import { cp } from "node:fs/promises";

const PORT = 8000;

const MIME_TYPES = {
  default: "application/octet-stream",
  html: "text/html; charset=UTF-8",
  js: "application/javascript",
  css: "text/css",
  png: "image/png",
  jpg: "image/jpeg",
  gif: "image/gif",
  ico: "image/x-icon",
  svg: "image/svg+xml",
};

const STATIC_PATH = path.join(process.cwd(), "./static");
const LIBRARY_PATH = path.join(process.cwd(), "./node_modules/iosignal/dist");

console.log(LIBRARY_PATH);

try {
  await cp(LIBRARY_PATH, STATIC_PATH + "/lib", {
    mode: fs.constants.COPYFILE_FICLONE,
    recursive: true,
  });
  console.log("successfully cp lib");
} catch (error) {
  console.error("lib cp error:", error);
}

const toBool = [() => true, () => false];

const prepareFile = async (url) => {
  console.log("url", url);
  const paths = [STATIC_PATH, url];

  if (url.endsWith("/")) {
    paths.push("index.html");
  }
  const filePath = path.join(...paths);
  const pathTraversal = !filePath.startsWith(STATIC_PATH);
  const exists = await fs.promises.access(filePath).then(...toBool);
  const found = !pathTraversal && exists;
  const streamPath = found ? filePath : STATIC_PATH + "/404.html";
  const ext = path.extname(streamPath).substring(1).toLowerCase();
  const stream = fs.createReadStream(streamPath);
  return { found, ext, stream };
};

const httpServer = http
  .createServer(async (req, res) => {
    const file = await prepareFile(req.url);
    const statusCode = file.found ? 200 : 404;
    const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
    res.writeHead(statusCode, { "Content-Type": mimeType });
    file.stream.pipe(res);
    console.log(`${req.method} ${req.url} ${statusCode}`);
  })
  .listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);

const ioss = new Server({
  httpServer: httpServer,
  // showMetric: 2,
  // showMessage: 'message'
});
