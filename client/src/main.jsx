import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CodeEagle Client Runtime Crash:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#080808', color: '#F5F3EF', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2 style={{ color: '#FF7A18', fontSize: '20px', marginBottom: '12px' }}>CodeEagle Application Error</h2>
          <p style={{ color: '#A6A29B', marginBottom: '20px' }}>An error occurred while rendering the application:</p>
          <pre style={{ background: '#161616', padding: '16px', borderRadius: '6px', overflow: 'auto', border: '1px solid #333', color: '#ff6b6b' }}>
            {this.state.error?.toString()}
          </pre>
          {this.state.errorInfo?.componentStack && (
            <pre style={{ marginTop: '16px', background: '#161616', padding: '16px', borderRadius: '6px', overflow: 'auto', border: '1px solid #333', color: '#888' }}>
              {this.state.errorInfo.componentStack}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#FF7A18', border: 'none', color: '#000', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);


