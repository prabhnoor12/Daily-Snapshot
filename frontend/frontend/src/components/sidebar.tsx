import  { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
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
            <NavLink to="/analytics" onClick={toggleSidebar}>Analytics</NavLink>
          </li>
          <li>
            <NavLink to="/settings" onClick={toggleSidebar}>Settings</NavLink>
          </li>
          <li>
            <NavLink to="/subscribe" onClick={toggleSidebar}>Subscribe</NavLink>
          </li>
          <li>
            <NavLink to="/user" onClick={toggleSidebar}>User Profile</NavLink>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
