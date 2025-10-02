import React from 'react';

function App() {
  const title = "My Application";
  const subtitle = "Welcome to our platform";
  const userName = "John Doe";
  const userEmail = "john@example.com";
  const isLoggedIn = true;
  
  const handleClick = () => {
    console.log('Button clicked');
  };
  
  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <img src="/logo.png" alt="Logo" />
        </div>
        <nav className="navigation">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </nav>
        {isLoggedIn && (
          <div className="user-info">
            <span>{userName}</span>
            <span>{userEmail}</span>
          </div>
        )}
      </header>
      
      <main className="main-content">
        <section className="hero">
          <h1>{title}</h1>
          <h2>{subtitle}</h2>
          <button onClick={handleClick}>Get Started</button>
        </section>
        
        <section className="features">
          <div className="feature-card">
            <h3>Feature 1</h3>
            <p>Description of feature 1</p>
            <button>Learn More</button>
          </div>
          <div className="feature-card">
            <h3>Feature 2</h3>
            <p>Description of feature 2</p>
            <button>Learn More</button>
          </div>
          <div className="feature-card">
            <h3>Feature 3</h3>
            <p>Description of feature 3</p>
            <button>Learn More</button>
          </div>
        </section>
        
        <section className="testimonials">
          <h2>What Our Users Say</h2>
          <div className="testimonial">
            <p>"This is an amazing product!"</p>
            <span>- User 1</span>
          </div>
          <div className="testimonial">
            <p>"I love using this application!"</p>
            <span>- User 2</span>
          </div>
          <div className="testimonial">
            <p>"Highly recommended!"</p>
            <span>- User 3</span>
          </div>
        </section>
      </main>
      
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact Us</a>
          </div>
          <div className="social-links">
            <a href="https://twitter.com">Twitter</a>
            <a href="https://facebook.com">Facebook</a>
            <a href="https://linkedin.com">LinkedIn</a>
          </div>
          <p>&copy; 2024 My Application. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
