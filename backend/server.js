const http = require("http");

const PORT = 3000;
const ANALYTICS_HOST = process.env.ANALYTICS_HOST || "job-analytics";
const ANALYTICS_PORT = Number(process.env.ANALYTICS_PORT || 4000);

let jobs = [
  { id: 1, title: "Frontend Developer (React + TS)", company: "JobConnect" },
  { id: 2, title: "Junior Backend Engineer", company: "JobConnect" },
];

function sendAnalyticsEvent(eventName, payload) {
  const body = JSON.stringify({ event: eventName, payload, ts: Date.now() });
  const req = http.request(
    {
      hostname: ANALYTICS_HOST,
      port: ANALYTICS_PORT,
      path: "/events",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    },
    (res) => res.resume()
  );
  req.on("error", () => {});
  req.write(body);
  req.end();
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/jobs") {
    sendAnalyticsEvent("jobs_listed", { count: jobs.length });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ service: "job-backend", jobs }));
    return;
  }

  if (req.method === "POST" && req.url === "/api/jobs") {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      const parsed = JSON.parse(raw || "{}");
      const newJob = {
        id: jobs.length + 1,
        title: parsed.title || "Untitled Role",
        company: parsed.company || "JobConnect",
      };
      jobs.push(newJob);
      sendAnalyticsEvent("job_created", newJob);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newJob));
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`job-backend running on 0.0.0.0:${PORT}`);
});