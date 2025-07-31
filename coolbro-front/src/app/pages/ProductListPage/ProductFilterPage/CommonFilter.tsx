import React from 'react';
import { FilterName } from '../../../constants/common';

interface CommonFilterProps {
    filterName: FilterName;
    filterOptions: any[];
    selectedFilterValues: number[];
    onFilterChange: (filterName: FilterName, filterValue: number) => void;
}

const CommonFilter: React.FC<CommonFilterProps> = ({
    filterName,
    filterOptions,
    selectedFilterValues,
    onFilterChange,
}) => {

    // Function to get the label for a filterName
    function getFilterLabel(filterName: FilterName): string {
        switch (filterName) {
            case FilterName.BRANDS:
                return 'Brands';
            case FilterName.TYPE:
                return 'Categories';
            case FilterName.ENERGY_RATING:
                return 'Energy Ratings';
            case FilterName.FEATURE:
                return 'Feature';
            case FilterName.PRICE:
                return 'Price';                
            case FilterName.ROOM_SIZE:
                return 'Room Size';
            case FilterName.COOLING_CAPACITY:
                return 'Cooling Technologies';
            case FilterName.AIR_PURIFICATION:
                return 'Air Purification';
            case FilterName.AVAILABILITY:
                return 'Availability';
            case FilterName.NOISE_LEVEL:
                return 'Noise Level';
            case FilterName.CAPACITIES:
                return 'Capacity';   
            case FilterName.WARRANTY_PERIOD:
                return 'Warranty Period';
            case FilterName.RATING:
                return 'Rating';
            default:
                return filterName;
        }
    }


    return (
        <div className='accordion-item'>
            <h2 className='accordion-header'>
                <button
                    className='accBtn accordion-button collapsed'
                    type='button'
                    data-bs-toggle='collapse'
                    data-bs-target={`#collapse${filterName}`}
                    aria-expanded='false'
                    aria-controls={`collapse${filterName}`}
                >
                    {getFilterLabel(filterName)}
                </button>
            </h2>
            <div
                id={`collapse${filterName}`}
                className='accordion-collapse collapse'
                aria-labelledby={`heading${filterName}`}
                data-bs-parent='#accordionExample'
            >
                <div className='accordion-body bodyAcc'>
                    {filterOptions.map((option: any) => (
                        <div className='form-check formCustomCheck' key={option.ID}>
                            <input
                                className='customCheckBox form-check-input'
                                type='checkbox'
                                value={option.ID}
                                id={`flexCheck${filterName}${option.ID}`}
                                onChange={() => onFilterChange(filterName, option.ID)}
                                checked={selectedFilterValues.includes(option.ID)}
                            />
                            <label
                                className='text-black form-check-label customCheckLabel'
                                htmlFor={`flexCheck${filterName}${option.ID}`}
                            >
                                {option.Name}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CommonFilter;
