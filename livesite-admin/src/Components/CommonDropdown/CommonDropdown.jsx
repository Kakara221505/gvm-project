import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap'; // Assuming you're using react-bootstrap
import downArrow from '../../Assets/Icons/ChevronArrow.png'
import './CommonDropdown.css'
const CommonDropdown = ({ title, items, selectedItem, handleSelect }) => {

  const handleItemClick = (item) => {
    handleSelect(item);
  };

  return (
    <Dropdown>
      <Dropdown.Toggle id="settingDropCommon" className="text-start settingDropCommon w-100 d-flex align-items-center justify-content-between custom-toggle-class" >
        {selectedItem ? selectedItem.label : title}
        <img src={downArrow} className="img-fluid border-start" alt="Dropdown Arrow" />
      </Dropdown.Toggle>

      <Dropdown.Menu className="w-100 custom-menu-class">
        {items.map((item, index) => (
          <Dropdown.Item key={index} href={item.href} onClick={() => handleItemClick(item)} className="custom-item-class">
            {item.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default CommonDropdown;
