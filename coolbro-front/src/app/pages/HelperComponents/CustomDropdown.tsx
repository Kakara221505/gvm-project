import React, { useState, useEffect, useRef } from 'react';
import './CustomDropdown.css';

interface CustomDropdownProps {
  options: string[];
  label: string;
  selectedOption: string;
  onChange: (option: string) => void;
  disabled?: boolean; // Add the disabled prop
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  label,
  selectedOption,
  onChange,
  disabled, // Destructure the disabled prop
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {

    function handleClickOutside(event: MouseEvent) {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (option: string) => {
    if (!disabled) { // Check if the dropdown is disabled
      onChange(option);
      setIsOpen(false);
    }
  };

  const handleToggleClick = () => {
    if (!disabled) { // Check if the dropdown is disabled
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      className={`custom-dropdown ${isOpen ? 'open' : ''}`}
      ref={dropdownRef} 
     
    >
      <label className={`fs-4 floating-label ${isOpen || selectedOption ? 'fs-4 active' : ''}`}>
        {label}
      </label>
      <div style={{ backgroundColor: disabled ? '#f0f0f0' : '' }} className={`dropdown-toggle1 ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} `}
        onClick={handleToggleClick} >
        {selectedOption || '' + label}
      </div>
      {isOpen && !disabled && ( // Check if the dropdown is not disabled
        <ul className='dropdown-options' >
          {options?.map((option) => (
            <li key={option} onClick={() => handleOptionClick(option)}>
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
