import React from 'react';

const ContactForm = () => {
  return (
    <form
      target="_blank"
      action="https://formsubmit.co/manojvamshi95@gmail.com"
      method="POST"
      style={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div
        className="form-group"
        style={{
          marginBottom: '20px',
        }}
      >
        <label
          htmlFor="name"
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '5px',
            color: '#333',
          }}
        >
          Name:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Your Name"
          required
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div
        className="form-group"
        style={{
          marginBottom: '20px',
        }}
      >
        <label
          htmlFor="email"
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '5px',
            color: '#333',
          }}
        >
          Forgot Email?
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Your Email"
          required
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <input type="hidden" name="_subject" value="New message from website" />

      <button
        type="submit"
        className="submit-btn"
        style={{
          padding: '10px 20px',
          backgroundColor: '#3498db',
          color: 'white',
          fontSize: '18px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.3s',
        }}
      >
        Submit Request
      </button>
    </form>
  );
};

export default ContactForm;