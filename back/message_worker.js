import { parentPort } from 'worker_threads';

// Receive messages from the main thread
parentPort.on('message', (message) => {
  console.log('Worker received:', message);
  
  // Process different message types
  if (typeof message === 'object' && message.type === 'task') {
    const result = processTask(message.data);
    parentPort.postMessage({ type: 'result', data: result });
  } else {
    // Echo the message back
    parentPort.postMessage(`Worker echoing: ${message}`);
  }
});

// Example task processor
function processTask(data) {
  if (Array.isArray(data)) {
    return data.map(x => x * 2);
  }
  return null;
} 