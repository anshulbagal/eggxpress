import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './Contact.css';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you soon. 🥚');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact-page">
      <div className="container">
        <div className="contact-hero">
          <h1 className="section-title">Get In <span>Touch</span></h1>
          <p className="section-sub">Have a question, feedback, or just want to say hi? We'd love to hear from you!</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            {[
              { icon: '📍', title: 'Visit Us', lines: ['123 Yolk Street, Dadar West', 'Mumbai, Maharashtra 400028'] },
              { icon: '📞', title: 'Call Us', lines: ['+91 98765 43210', '+91 87654 32109'] },
              { icon: '📧', title: 'Email Us', lines: ['hello@eggxpress.in', 'orders@eggxpress.in'] },
              { icon: '⏰', title: 'Open Hours', lines: ['Monday – Sunday', '10:00 AM – 11:00 PM'] },
            ].map((info, i) => (
              <div key={i} className="info-card">
                <div className="info-icon">{info.icon}</div>
                <div>
                  <h3>{info.title}</h3>
                  {info.lines.map((line, j) => <p key={j}>{line}</p>)}
                </div>
              </div>
            ))}
          </div>

          <div className="contact-form-wrap">
            <h3>Send a Message</h3>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label>Your Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@example.com" required />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Tell us what's on your mind..." rows={5} required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>
                Send Message ✉️
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
