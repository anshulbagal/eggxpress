import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-bg">
        <div className="not-found-blob blob-1" />
        <div className="not-found-blob blob-2" />
      </div>

      <div className="not-found-card">
        <div className="not-found-emoji-wrap">
          <span className="not-found-emoji animate-egg">🥚</span>
          <span className="not-found-question">❓</span>
        </div>
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Egg-stremely Lost!</h2>
        <p className="not-found-text">
          Oops! It looks like this roll has rolled off the table. The page you are looking for doesn't exist or has been eaten! 😋
        </p>
        <Link to="/" className="btn-primary not-found-btn">
          Back to Home 🍳
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
