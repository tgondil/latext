import React from 'react';
import './TextInput.css';

function TextInput({ value, onChange, placeholder }) {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="text-input-container">
      <div className="text-input-header">
        <h3>Input Text</h3>
        <div className="char-count">
          {value.length} characters
        </div>
      </div>
      <textarea
        className="text-input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={25}
        autoFocus
      />
    </div>
  );
}

export default TextInput; 