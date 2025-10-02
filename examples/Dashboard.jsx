import React from 'react';

function Dashboard() {
  const stats = { users: 1250, revenue: 52000, growth: 12.5 };
  const currentUser = { name: 'John Doe', role: 'Admin' };
  
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>{currentUser.name}</span>
          <span className="role">{currentUser.role}</span>
        </div>
      </header>
      
      <main className="dashboard-content">
        <section className="statistics-panel">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.users}</p>
          </div>
          <div className="stat-card">
            <h3>Revenue</h3>
            <p className="stat-value">${stats.revenue}</p>
          </div>
          <div className="stat-card">
            <h3>Growth</h3>
            <p className="stat-value">{stats.growth}%</p>
          </div>
        </section>
        
        <section className="recent-activity">
          <h2>Recent Activity</h2>
          <ul className="activity-list">
            <li>User registration completed</li>
            <li>Payment processed</li>
            <li>New feature deployed</li>
            <li>System backup completed</li>
          </ul>
        </section>
      </main>
      
      <footer className="dashboard-footer">
        <p>&copy; 2024 My App</p>
        <nav>
          <a href="/help">Help</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </footer>
    </div>
  );
}

export default Dashboard;
