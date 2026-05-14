import os from "node:os";
import app from "./app.js";
import { env } from "./config/env.js";

const host = "0.0.0.0";

app.listen(env.port, host, () => {
  console.log(`API em http://localhost:${env.port} (e na rede: porta ${env.port})`);
  const nets = os.networkInterfaces();
  for (const addrs of Object.values(nets)) {
    for (const a of addrs || []) {
      const ipv4 = a.family === "IPv4" || a.family === 4;
      if (ipv4 && !a.internal) {
        console.log(`  → http://${a.address}:${env.port}`);
      }
    }
  }
});
