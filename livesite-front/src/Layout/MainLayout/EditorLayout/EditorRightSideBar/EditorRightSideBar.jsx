import React, { useState } from 'react';

export default function EditorRightSideBar({ isOpen, onClose }) {
  return (
    <div className={`right-sidebar ${isOpen ? 'open' : ''}`}>
      <div>RightSideBar</div>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
