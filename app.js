const { useState } = React;

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Hello from React!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Click Me</button>
    </div>
  );
}

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
