import React from 'react';

// TypeScript interface (this was causing the parser error)
interface DashboardProps {
  userName: string;
  stats: StatsData;
}

interface StatsData {
  users: number;
  revenue: number;
  growth: number;
}

const Dashboard: React.FC<DashboardProps> = ({ userName, stats }) => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>{userName}</span>
          <span className="role">Admin</span>
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
};

export default Dashboard;
