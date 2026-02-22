import React from 'react';
import './About.css';

const About = () => (
  <div className="about-page">
    <div className="about-hero">
      <div className="container">
        <h1 className="section-title">About <span>EggXpress</span></h1>
        <p className="section-sub">The story behind Mumbai's favourite egg roll destination</p>
      </div>
    </div>

    <div className="container">
      <div className="about-grid">
        <div className="about-img-wrap">
          <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600" alt="Our Kitchen" />
        </div>
        <div className="about-text">
          <h2>Born on the Streets of Mumbai 🌆</h2>
          <p>
            EggXpress started in 2015 as a humble street stall in Dadar, Mumbai. Our founder Rajan Mehta
            had a simple dream: to serve the most delicious egg rolls the city had ever tasted — made with
            the freshest ingredients and cooked with pure passion.
          </p>
          <p>
            What began as a 3-stall operation has grown into Mumbai's most-loved quick-service restaurant,
            with delivery across 15+ locations. Our recipes haven't changed — only our reach has grown.
          </p>
          <div className="about-stats">
            <div className="a-stat"><span className="a-num">9+</span><span>Years of Service</span></div>
            <div className="a-stat"><span className="a-num">50K+</span><span>Customers Served</span></div>
            <div className="a-stat"><span className="a-num">15+</span><span>Locations</span></div>
          </div>
        </div>
      </div>

      <div className="values-section">
        <h2 className="section-title" style={{ textAlign: 'center' }}>Our <span>Values</span></h2>
        <div className="values-grid">
          {[
            { icon: '🥚', title: 'Quality First', desc: 'We never compromise on ingredient quality. Only the freshest, farm-to-table produce.' },
            { icon: '❤️', title: 'Made with Love', desc: 'Every roll is crafted by hand. No machine can replicate the love our chefs put in.' },
            { icon: '🌿', title: 'Sustainable', desc: 'We source locally, reduce waste, and are committed to eco-friendly practices.' },
            { icon: '🤝', title: 'Community', desc: 'We give back. A portion of our profits goes to feeding underprivileged children.' },
          ].map((v, i) => (
            <div key={i} className="value-card">
              <div className="v-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="team-section">
        <h2 className="section-title" style={{ textAlign: 'center' }}>Meet the <span>Team</span></h2>
        <div className="team-grid">
          {[
            { name: 'Rajan Mehta', role: 'Founder & CEO', emoji: '👨‍💼' },
            { name: 'Priya Sharma', role: 'Head Chef', emoji: '👩‍🍳' },
            { name: 'Arjun Patel', role: 'Operations Lead', emoji: '👨‍💻' },
          ].map((m, i) => (
            <div key={i} className="team-card">
              <div className="team-avatar">{m.emoji}</div>
              <h3>{m.name}</h3>
              <span>{m.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default About;
