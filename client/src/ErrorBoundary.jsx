import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, background: '#0f0f13', minHeight: '100vh', color: '#f0f0f5', fontFamily: 'monospace' }}>
          <h2 style={{ color: '#e8315a', marginBottom: 16 }}>App crashed — error details:</h2>
          <pre style={{ background: '#1a1a24', padding: 16, borderRadius: 8, color: '#f59e0b', whiteSpace: 'pre-wrap', fontSize: 13 }}>
            {this.state.error.toString()}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ marginTop: 24, padding: '10px 20px', background: '#e8315a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
          >
            Clear cache &amp; reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
