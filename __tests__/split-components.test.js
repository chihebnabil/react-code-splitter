const jscodeshift = require('jscodeshift');
const transform = require('../split-components');

describe('split-components transform', () => {
  it('should identify extractable components in a function component (dry run)', () => {
    const input = `import React from 'react';

function App() {
  const title = "Test";
  
  return (
    <div>
      <header className="header">
        <h1>{title}</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
        </nav>
      </header>
    </div>
  );
}

export default App;`;

    const fileInfo = { path: 'test.jsx', source: input };
    const api = { jscodeshift, stats: jest.fn(), report: jest.fn() };
    const options = { dry: true };
    
    const output = transform(fileInfo, api, options);
    
    // In dry mode, should not modify the source
    expect(output).toBeUndefined();
    expect(api.stats).toHaveBeenCalledWith('components-found', expect.any(Number));
  });

  it('should handle components with no extractable parts', () => {
    const input = `import React from 'react';

function SimpleComponent() {
  return <div>Hello</div>;
}

export default SimpleComponent;`;

    const fileInfo = { path: 'test.jsx', source: input };
    const api = { jscodeshift, stats: jest.fn(), report: jest.fn() };
    const options = {};
    
    const output = transform(fileInfo, api, options);
    
    // No extractable components, should not modify
    expect(output).toBeUndefined();
  });

  it('should work with arrow function components', () => {
    const input = `import React from 'react';

const App = () => {
  const name = "User";
  
  return (
    <div>
      <section className="profile">
        <h1>{name}</h1>
        <p>Profile information</p>
        <button>Edit</button>
      </section>
    </div>
  );
};

export default App;`;

    const fileInfo = { path: 'test.jsx', source: input };
    const api = { jscodeshift, stats: jest.fn(), report: jest.fn() };
    const options = { dry: true };
    
    const output = transform(fileInfo, api, options);
    
    // In dry mode, should not modify
    expect(output).toBeUndefined();
  });

  it('should work with class components', () => {
    const input = `import React from 'react';

class App extends React.Component {
  render() {
    const title = "My App";
    
    return (
      <div>
        <header className="header">
          <h1>{title}</h1>
          <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
          </nav>
        </header>
      </div>
    );
  }
}

export default App;`;

    const fileInfo = { path: 'test.jsx', source: input };
    const api = { jscodeshift, stats: jest.fn(), report: jest.fn() };
    const options = { dry: true };
    
    const output = transform(fileInfo, api, options);
    
    // In dry mode, should not modify
    expect(output).toBeUndefined();
  });
});
