import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import { ReactFlowProvider } from 'reactflow'; // ✅ 추가

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ReactFlowProvider> {/* ✅ 감싸기 */}
      <App />
    </ReactFlowProvider>
  </React.StrictMode>
);