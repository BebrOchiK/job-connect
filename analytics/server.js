const http = require("http");

const PORT = 4000;
const events = [];

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/events") {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      const parsed = JSON.parse(raw || "{}");
      events.push(parsed);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "recorded", total: events.length }));
    });
    return;
  }

  if (req.method === "GET" && req.url === "/stats") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        service: "job-analytics",
        totalEvents: events.length,
        events,
      })
    );
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`job-analytics running on 0.0.0.0:${PORT}`);
});