import { generateQuestions } from './notes-generator.js';

// Dedicated module worker. A job ID lets the UI ignore stale extraction results.
self.addEventListener('message', event => {
  const {jobId, pages, limit} = event.data || {};
  try {
    const result = generateQuestions(pages, {limit});
    self.postMessage({type: 'result', jobId, result});
  } catch (error) {
    self.postMessage({type: 'error', jobId, message: error instanceof Error ? error.message : 'Could not generate study cards.'});
  }
});
