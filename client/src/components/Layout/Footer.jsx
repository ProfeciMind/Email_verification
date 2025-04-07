import React from 'react';
import './Layout.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <p>Email Marketing Sequence Builder &copy; {new Date().getFullYear()}</p>
          <div className="footer-links">
            <a href="#!">Privacy Policy</a>
            <a href="#!">Terms of Service</a>
            <a href="#!">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;