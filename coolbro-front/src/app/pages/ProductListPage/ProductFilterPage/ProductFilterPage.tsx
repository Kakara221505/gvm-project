import { FC, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import { ProductFilterPageStyles } from '../ProductFilterPage/ProductFilterPageStyles'
import OffCanvas from 'react-bootstrap/Offcanvas'
import axios from 'axios';
import AccordionSection from './AccordionSection'
import { FilterName, Filters, InitialFilters } from '../../../constants/common';
import cloneDeep from 'clone-deep';

interface ProductFilterCanvasProps {
  showOffCanvasFilter: boolean;
  parentToChild: (isVisibleOffCanvas: boolean) => void;
  onFilterChange: (selectedFilters: Filters) => void;
}

const ProductFilterPage: FC<ProductFilterCanvasProps> =
  ({
    showOffCanvasFilter,
    parentToChild,
    onFilterChange,
  }) => {
    const location = useLocation();
    const [show, setShow] = useState(false);
    const [filters, setFilters] = useState<Filters>(cloneDeep(InitialFilters));
    const [selectedFilterValues, setSelectedFilterValues] = useState<Filters>(cloneDeep(InitialFilters));

    const handleClose = () => {
      setShow(!show);
      parentToChild(!show)
    }
    const handleShow = () => setShow(true);

    useEffect(() => {
      setShow(showOffCanvasFilter);
    }, [showOffCanvasFilter])

    useEffect(() => {
      fetchData();
    }, []);

    const fetchData = () => {
      // Fetch data from your API using Axios
      axios
        .get(`${process.env.REACT_APP_SERVER_URL}/product/product-filter`)
        .then((response) => {
          const data = response.data.data;
          // Set your filter options here, for example:
          const updatedFilters: Filters = {
            [FilterName.BRANDS]: data.Brands,
            [FilterName.CAPACITIES]: data.Capacity,
            [FilterName.ENERGY_RATING]: data['Energy Ratings'],
            [FilterName.PRICE]: data.Price,
            [FilterName.TYPE]: data.Categories,
            [FilterName.FEATURE]: data.Feature,
            [FilterName.ROOM_SIZE]: data['Room Size'],
            [FilterName.NOISE_LEVEL]: data['Noise Level'],
            [FilterName.AVAILABILITY]: data.Availability,
            [FilterName.AIR_PURIFICATION]: data['Air Purification'],
            [FilterName.COOLING_CAPACITY]: data['Cooling Technologies'],
            [FilterName.WARRANTY_PERIOD]: data['Warranty Period'],
            [FilterName.RATING]: data['Rating'],
          };
          setFilters(updatedFilters);

          // Extract brandId from the query string
          const params = new URLSearchParams(location.search);
          const brandIdParam = params.get('brandId');

          // Check if brandId is present in the query string
          if (brandIdParam) {
            handleFilterChange(FilterName.BRANDS, brandIdParam);
          }

          // Extract roomSize from the query string
          const roomSizeParam = params.get('roomSize');

          // Check if brandId is present in the query string
          if (roomSizeParam) {
            handleFilterChange(FilterName.ROOM_SIZE, roomSizeParam);
          }
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    };

    const handleFilterChange = (filterName: FilterName, filterValue: any) => {

      setSelectedFilterValues((prevSelectedFilterValues) => {
        const updatedSelectedFilters = { ...prevSelectedFilterValues };

        // Find the index of the filterValue in the selected filter values
        const filterIndexSelected = updatedSelectedFilters[filterName].indexOf(filterValue);

        if (filterIndexSelected === -1) {
          updatedSelectedFilters[filterName].push(filterValue);
        } else {
          updatedSelectedFilters[filterName].splice(filterIndexSelected, 1);
        }
        onFilterChange(updatedSelectedFilters);
        return updatedSelectedFilters;
      });

    };

    const clearAllFilters = () => {
      setSelectedFilterValues(cloneDeep(InitialFilters));
      onFilterChange(cloneDeep(InitialFilters));
    };

    return (
      <>
        <ProductFilterPageStyles>
          <section className='marginPageMYMobile mt-17'>
            <AccordionSection
              filters={filters}
              selectedFilterValues={selectedFilterValues}
              handleFilterChange={handleFilterChange}
              clearAllFilters={clearAllFilters}
              isOffCanvas={false}
            />
            <OffCanvas placement='end' show={show} onHide={handleClose}>
              <OffCanvas.Header closeButton>
                <OffCanvas.Title className='fs-1 '>

                </OffCanvas.Title>
              </OffCanvas.Header>
              <OffCanvas.Body>
                <ProductFilterPageStyles>
                  <AccordionSection
                    filters={filters}
                    selectedFilterValues={selectedFilterValues}
                    handleFilterChange={handleFilterChange}
                    clearAllFilters={clearAllFilters}
                    isOffCanvas={true}
                  />
                </ProductFilterPageStyles>
              </OffCanvas.Body>
            </OffCanvas>
          </section>
        </ProductFilterPageStyles>
      </>
    )
  }

export default ProductFilterPage


