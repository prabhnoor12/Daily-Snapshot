import  { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiMenu, FiX, FiBarChart2, FiSettings, FiCreditCard, FiUser } from 'react-icons/fi';
import './sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="menu-icon" onClick={toggleSidebar}>
        {isOpen ? <FiX /> : <FiMenu />}
      </div>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>My App</h3>
        </div>
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/analytics" onClick={toggleSidebar}>
              <FiBarChart2 style={{ marginRight: '8px' }} /> Analytics
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" onClick={toggleSidebar}>
              <FiSettings style={{ marginRight: '8px' }} /> Settings
            </NavLink>
          </li>
          <li>
            <NavLink to="/subscribe" onClick={toggleSidebar}>
              <FiCreditCard style={{ marginRight: '8px' }} /> Subscribe
            </NavLink>
          </li>
          <li>
            <NavLink to="/user" onClick={toggleSidebar}>
              <FiUser style={{ marginRight: '8px' }} /> User Profile
            </NavLink>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
