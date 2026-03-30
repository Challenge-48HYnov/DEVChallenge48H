const { Worker } = require("worker_threads");

// Create a worker
const worker = new Worker("./message_worker.js");

let workerTime = 0;
const timer = 1000;

async function repeatAsync() {
  while (true) {
    // await fetchData();
    console.debug("In Worker: ", workerTime);
    workerTime += 1;
    worker.postMessage(workerTime);
    await new Promise((resolve) => setTimeout(resolve, timer));
  }
}

repeatAsync();

// Send messages to the worker
worker.postMessage("Hello worker!");
worker.postMessage({ type: "task", data: [1, 2, 3, 4, 5] });

// Receive messages from the worker
worker.on("message", (message) => {
  console.log("Main thread received:", message);
});

// Handle worker completion
worker.on("exit", (code) => {
  console.log(`Worker exited with code ${code}`);
});
