import React from 'react';
import './CommonColorPicker.css'
function CommonColorPicker({ value, onChange }) {
  const handleColorChange = (event) => {
    onChange(event.target.value);
  };
  const shortenedValue = value ? value.substring(0, 7) : '';

  return (
    <span className="color-picker w-100 overflow-hidden">
      <label htmlFor="colorPicker">
        <input
          type="color"
          value={value}
          id="colorPicker"
          onChange={handleColorChange}
        />
      </label>
      <span onChange={handleColorChange} className='colorSpan ps-1 mb-1 text-black fw-medium'>{shortenedValue}</span>
    </span>
  );
}

export default CommonColorPicker;
