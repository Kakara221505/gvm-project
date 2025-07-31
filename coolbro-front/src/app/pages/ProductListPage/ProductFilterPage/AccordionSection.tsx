import React from 'react'
import CommonFilter from './CommonFilter'
import { FilterName, Filters } from '../../../constants/common'
import { ProductFilterPageStyles } from './ProductFilterPageStyles'
interface AccordionSectionProps {
  filters: Filters
  selectedFilterValues: Filters
  handleFilterChange: (filterName: FilterName, filterValue: number) => void
  clearAllFilters: () => void
  isOffCanvas: boolean
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  filters,
  selectedFilterValues,
  handleFilterChange,
  clearAllFilters,
  isOffCanvas,
}) => {
  const handleClearFilter = (filterName: FilterName, filterValue: number) => {
    handleFilterChange(filterName, filterValue);
  };

  return (
    <ProductFilterPageStyles>
      <div
        className={`accordion bg-white border-bottom-2 filterMain ${isOffCanvas ? 'shadow-none border-0' : ''
          }`}
        id={`accordion-${isOffCanvas ? 'web' : 'mobile'}`}
      >
        <div className='d-flex justify-content-between pt-3'>
          {isOffCanvas ? '' : <h2 className='headText ps-5  pt-4 mb-0'>Filters</h2>}
          {Object.values(selectedFilterValues).some((filterValues) => filterValues.length > 0) && (
            <div className='my-5 mb-0'>
              <p className='small-text mb-0'>
                <span
                  className='headText underLineClear  primaryTextMedium fs-5 pe-5 cursor-pointer pt-4 mb-0'
                  onClick={clearAllFilters}
                >
                  CLEAR ALL
                </span>
              </p>
            </div>
          )}
        </div>
        <div className={`marginPageMYMobile ${Object.values(selectedFilterValues).some(filterValues => filterValues.length > 0) ? ' p-5 d-flex flex-wrap gap-2' : ''}`}>
          {Object.entries(selectedFilterValues).map(
            ([filterName, filterValues]) =>
              filterValues.length > 0 && (
                <React.Fragment key={filterName as FilterName}>
                  {filterValues.map((value: any) => {
                    const filterItem: any = filters[filterName as FilterName].find(
                      (filter: any) => filter.ID === value
                    );
                    const name = filterItem ? filterItem.Name : 'Unknown';
                    return (
                      <span
                        key={value}
                        className='d-flex align-items-center px-4 py-2 badgeSecondary cursor-pointer p-1 rounded-1'
                        onClick={() => handleClearFilter(filterName as FilterName, value)}
                      >
                        <i className='fa fa-close text-black pe-1' />
                        {name}
                      </span>
                    );
                  })}
                </React.Fragment>
              )
          )}
        </div>

        <CommonFilter
          filterName={FilterName.BRANDS}
          filterOptions={filters.brands}
          selectedFilterValues={selectedFilterValues.brands}
          onFilterChange={handleFilterChange}
        />
        <CommonFilter
          filterName={FilterName.TYPE}
          filterOptions={filters.type}
          selectedFilterValues={selectedFilterValues.type}
          onFilterChange={handleFilterChange}
        />
        <CommonFilter
          filterName={FilterName.ENERGY_RATING}
          filterOptions={filters.energyRating}
          selectedFilterValues={selectedFilterValues.energyRating}
          onFilterChange={handleFilterChange}
        />
        <CommonFilter
          filterName={FilterName.FEATURE}
          filterOptions={filters.feature}
          selectedFilterValues={selectedFilterValues.feature}
          onFilterChange={handleFilterChange}
        />
        <CommonFilter
          filterName={FilterName.PRICE}
          filterOptions={filters.price}
          selectedFilterValues={selectedFilterValues.price}
          onFilterChange={handleFilterChange}
        />
        <CommonFilter
          filterName={FilterName.ROOM_SIZE}
          filterOptions={filters.roomSize}
          selectedFilterValues={selectedFilterValues.roomSize}
          onFilterChange={handleFilterChange}
        />
        <CommonFilter
          filterName={FilterName.COOLING_CAPACITY}
          filterOptions={filters.coolingCapacity}
          selectedFilterValues={selectedFilterValues.coolingCapacity}
          onFilterChange={handleFilterChange}
        />
        <CommonFilter
          filterName={FilterName.AIR_PURIFICATION}
          filterOptions={filters.airPurification}
          selectedFilterValues={selectedFilterValues.airPurification}
          onFilterChange={handleFilterChange}
        />
         <CommonFilter
          filterName={FilterName.AVAILABILITY}
          filterOptions={filters.availability}
          selectedFilterValues={selectedFilterValues.availability}
          onFilterChange={handleFilterChange}
        />
        <CommonFilter
          filterName={FilterName.NOISE_LEVEL}
          filterOptions={filters.noiseLevel}
          selectedFilterValues={selectedFilterValues.noiseLevel}
          onFilterChange={handleFilterChange}
        />
        <CommonFilter
          filterName={FilterName.CAPACITIES}
          filterOptions={filters.capacities}
          selectedFilterValues={selectedFilterValues.capacities}
          onFilterChange={handleFilterChange}
        />
        <CommonFilter
          filterName={FilterName.WARRANTY_PERIOD}
          filterOptions={filters.warrantyPeriod}
          selectedFilterValues={selectedFilterValues.warrantyPeriod}
          onFilterChange={handleFilterChange}
        />
        <CommonFilter
          filterName={FilterName.RATING}
          filterOptions={filters.rating}
          selectedFilterValues={selectedFilterValues.rating}
          onFilterChange={handleFilterChange}
        />
        {/* <div className='my-5 pb-5'>
        <button className='d-flex m-auto btn btn-default primaryBtn col-lg-11 py-5 text-center justify-content-center' onClick={clearAllFilters}>
          CLEAR ALL FILTERS
        </button>
      </div> */}
      </div>
    </ProductFilterPageStyles>
  )
}

export default AccordionSection
