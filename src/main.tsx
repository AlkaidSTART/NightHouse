import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './app/app.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('缺少根节点 #root');
}

// PlayCanvas owns the WebGL canvas. StrictMode's simulated unmount would destroy
// that context between dev remounts, so the game shell is mounted once.
createRoot(container).render(<App />);
