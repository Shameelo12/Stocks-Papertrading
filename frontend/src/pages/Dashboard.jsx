import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>Paper Trading</h1>
        </div>
        <div className="navbar-right">
          <span>{user?.email}</span>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome, {user?.email}!</h2>
          <p>Your Account Balance</p>
          <h3 className="balance">${(user?.balance || 0).toFixed(2)}</h3>
          <p className="subtitle">Starting balance: $10,000.00</p>
        </div>

        <div className="placeholder-section">
          <h3>Coming Soon</h3>
          <p>Portfolio and trading features will appear here as we build them out.</p>
          <ul>
            <li>View your holdings</li>
            <li>Track your portfolio performance</li>
            <li>Buy and sell stocks</li>
            <li>View transaction history</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
