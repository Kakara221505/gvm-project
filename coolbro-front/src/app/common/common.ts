export function fetchCountryNames() {
    const countries = require('country-data').callingCountries;
    const processedCountries: Record<string, boolean> = {};
    const result: string[] = [];
  
    for (const countryCode in countries) {
      if (countries.hasOwnProperty(countryCode) && countryCode !== 'all') {
        const country = countries[countryCode];
        const countryName = country.name;
  
        if (!processedCountries[countryName]) {
          result.push(countryName);
          processedCountries[countryName] = true;
        }
      }
    }
    return result;
  }

  export function getFormattedDate(initialDate:any){
 
  const dateObject = new Date(initialDate);
  
  // Get the day, month, and year components
  const day = dateObject.getDate().toString().padStart(2, '0');
  const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  const year = dateObject.getFullYear();
  
  // Create the formatted date string in "dd-mm-yyyy" format
  const formattedDate = `${day}-${month}-${year}`;
  
  // console.log(formattedDate); // Output: 13-09-2023
  return formattedDate
  }
  
  