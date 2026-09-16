import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaWpforms, FaUsers, FaCogs, FaSignOutAlt, FaPlus, FaBell } from 'react-icons/fa';
import '../styles/login.css'; // Reuse core auth background variables

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="auth-page-wrapper" style={{ flexDirection: 'column', gap: '30px' }}>
      <div className="bg-bubble bubble-1"></div>
      <div className="bg-bubble bubble-2"></div>
      <div className="bg-bubble bubble-3"></div>

      {/* Main Admin Card */}
      <div className="auth-card" style={{ maxWidth: '800px', width: '90%' }}>
        <header className="auth-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', textAlign: 'left' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaUserShield style={{ color: '#c084fc', fontSize: '2rem' }} />
              <h1 className="auth-title" style={{ margin: 0, fontSize: '1.8rem' }}>Admin Control Center</h1>
            </div>
            <p className="auth-subtitle" style={{ marginTop: '5px' }}>College Form Generator Portal</p>
          </div>
          <button 
            type="button" 
            onClick={handleLogout} 
            className="btn btn-reset" 
            style={{ flex: 'initial', padding: '10px 16px', borderRadius: '10px', display: 'flex', gap: '8px' }}
          >
            <FaSignOutAlt /> Logout
          </button>
        </header>

        {/* Dashboard Stat Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '35px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <FaWpforms style={{ fontSize: '2rem', color: '#c084fc', marginBottom: '10px' }} />
            <h3 style={{ fontSize: '1.8rem', fontWeight: 700 }}>42</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Active Templates</p>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <FaUsers style={{ fontSize: '2rem', color: '#6366f1', marginBottom: '10px' }} />
            <h3 style={{ fontSize: '1.8rem', fontWeight: 700 }}>1,284</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Users</p>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <FaCogs style={{ fontSize: '2rem', color: '#ec4899', marginBottom: '10px' }} />
            <h3 style={{ fontSize: '1.8rem', fontWeight: 700 }}>99.9%</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>System Uptime</p>
          </div>
        </div>

        {/* Core Actions */}
        <div style={{ textAlign: 'left', marginBottom: '25px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#ffffff' }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ flex: 'initial', padding: '12px 24px', display: 'flex', gap: '8px' }}>
              <FaPlus /> Create New Form Template
            </button>
            <button className="btn btn-reset" style={{ flex: 'initial', padding: '12px 24px', display: 'flex', gap: '8px' }}>
              <FaBell /> System Alerts
            </button>
          </div>
        </div>

        {/* Recent logs */}
        <div style={{ textAlign: 'left', background: 'rgba(15, 23, 42, 0.3)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#ffffff' }}>Recent Activity Logs</h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid rgba(255, 255, 255, 0.03)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-main)' }}>Admission Form 2026 published</span>
              <span style={{ color: 'var(--text-muted)' }}>Just now</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid rgba(255, 255, 255, 0.03)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-main)' }}>User 'kamali' registered successfully</span>
              <span style={{ color: 'var(--text-muted)' }}>10 mins ago</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-main)' }}>Backup server synchronised</span>
              <span style={{ color: 'var(--text-muted)' }}>1 hour ago</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
