import { Worker } from "worker_threads";

const worker = new Worker(new URL("./message_worker.js", import.meta.url), { type: "module" });
let workerTick = 0;
const timer = 500000; // keep existing cadence requirement
let inFlight = false;

worker.on("message", (message) => {
  if (message?.type === "ingest_done" || message?.type === "ingest_error") {
    inFlight = false;
  }
  console.log("Main thread received:", message);
});

worker.on("error", (err) => {
  inFlight = false;
  console.error("Worker error:", err.message);
});

worker.on("exit", (code) => {
  console.log(`Worker exited with code ${code}`);
});

async function repeatAsync() {
  while (true) {
    if (!inFlight) {
      workerTick += 1;
      inFlight = true;
      worker.postMessage({
        type: "ingest_csv",
        tick: workerTick,
      });
    }
    await new Promise((resolve) => setTimeout(resolve, timer));
  }
}

repeatAsync();
