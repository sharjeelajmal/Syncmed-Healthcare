const http = require("http");
const { exec } = require("child_process");

const PORT = 4000;
const DEPLOY_COMMAND =
  "git pull origin main && npm install && npm run build && pm2 restart syncmed";

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/webhook") {
    console.log("[webhook] Deploy request received");

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");

    exec(DEPLOY_COMMAND, (error, stdout, stderr) => {
      if (error) {
        console.error("[webhook] Deploy failed:", error.message);
        if (stderr) console.error("[webhook] stderr:", stderr);
        return;
      }

      console.log("[webhook] Deploy succeeded");
      if (stdout) console.log("[webhook] stdout:", stdout);
      if (stderr) console.warn("[webhook] stderr:", stderr);
    });

    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`[webhook] Listening on port ${PORT}`);
});
