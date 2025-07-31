const { async } = require('@firebase/util');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const countryList = require('country-list');
const { fn, col } = require('sequelize');

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

function randomFourDigitCode() {
    return Math.floor(1000 + Math.random() * 9000);
}

async function getCountryCode(country) {
    try {
        // const response = await axios.get(`https://restcountries.com/v2/name/${country}?fullText=true`);
        // const countryCode = response.data[0]?.alpha2Code || '';
        // return countryCode;
        const countryCode = countryList.getCode(country);
        return countryCode;
    } catch (error) {
        console.error('Error fetching country code:', error);
        return '';
    }
}

async function getFileSize(filePath) {
    return new Promise((resolve, reject) => {
        try {
            const stats = fs.statSync(filePath);
            const fileSizeInBytes = stats.size;
            const fileSizeInKB = fileSizeInBytes / 1024;
            const fileSizeInMB = fileSizeInKB / 1024;

            console.log(`File Size: ${fileSizeInMB} MB`);
            resolve(fileSizeInMB.toFixed(2));
        } catch (err) {
            // console.log(err)
            reject(0);
        }
    });
}

async function calculateAge(dateOfBirth) {
    const dob = new Date(dateOfBirth);
    const now = new Date();

    // Calculate the difference in milliseconds between the current date and DOB
    const diffInMs = now - dob;

    // Calculate the difference in years
    const ageDate = new Date(diffInMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    return age;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatDateFull(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const earthRadiusKm = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadiusKm * c;
    return distance.toFixed(2);
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

function calculateSubscriptionEndDate(startDate, duration) {
    const startDateObj = new Date(startDate); // Convert the start date string to a Date object

    // Determine the duration in milliseconds based on the plan duration
    let durationInMs = 0;
    switch (duration) {
        case 'monthly':
            durationInMs = 30 * 24 * 60 * 60 * 1000; // 30 days
            break;
        case 'quarterly':
            durationInMs = 3 * 30 * 24 * 60 * 60 * 1000; // 90 days
            break;
        case 'halfyearly':
            durationInMs = 6 * 30 * 24 * 60 * 60 * 1000; // 180 days
            break;
        case 'yearly':
            durationInMs = 365 * 24 * 60 * 60 * 1000; // 365 days
            break;
        default:
            // Handle custom or other duration here
            // You might need additional logic to calculate the duration
            break;
    }

    const endDateObj = new Date(startDateObj.getTime() + durationInMs); // Add the duration to the start date

    return endDateObj.toISOString().split('T')[0]; // Format the end date as 'YYYY-MM-DD' string
}

async function getZipCodeDetails(zipCode) {
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
            params: {
                address: zipCode,
                key: googleMapsApiKey,
            },
        });

        const result = response.data.results[0];

        if (!result) {
            throw new Error('Invalid location');
        }

        const addressComponents = result.address_components;
        const { location } = result.geometry || {};

        const { long_name: city } = addressComponents.find(component => component.types.includes('locality')) || {};
        const { long_name: state } = addressComponents.find(component => component.types.includes('administrative_area_level_1')) || {};
        const { long_name: country } = addressComponents.find(component => component.types.includes('country')) || {};

        return { city, state, country, location };

    } catch (error) {
        return { city: null, state: null, country: null, location: null };
        // throw error;
    }
}

async function getZipcodeAndArea(lat, lng) {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                latlng: `${lat},${lng}`,
                key: googleMapsApiKey,
            },
        });

        const result = response.data;

        if (result.status === 'OK') {
            let zipcode, area;

            const addressComponents = result.results[0].address_components;
            addressComponents.forEach((component) => {
                if (component.types.includes('postal_code')) {
                    zipcode = component.long_name;
                } else if (component.types.includes('locality')) {
                    area = component.long_name;
                }
            });

            return { zipcode, area };
        } else {
            console.error(`Error: ${result.status} - ${result.error_message || 'No error message provided'}`);
            return { zipcode: null, area: null };
        }
    } catch (error) {
        console.error(error);
        return { zipcode: null, area: null };
    }
}
//==========CONST================

const LoginTypeEnum = {
    EMAIL: '0',
    PHONE: '1',
    SOCIAL: '2'
};

const UserRole = {
    ADMIN: '1',
    USER: '2',
    SUPERADMIN: "3",
    DISTRIBUTOR: "4",
    DEALER: "5",
    STAFF: "6"
};

const CapacityTypeEnum = {
    "1-ton": '1',
    "1.5-ton": '1.5',
    "2-ton": '2',
    "2.5-ton": '2.5',
    "3-ton": '3'
};
const RoomSizeEnum = {
    "small": 'Small room',
    "medium": 'Medium room',
    "large": 'Large room',
    "extra-large": 'Extra-Large room'
};
const AvailabilityEnum = {
    "In-stock": '1',
    "Out-of-stock": '0'
};
const CoolingCapacityEnum = {
    "Conventional-compressor": 'Conventional compressor',
    "Inverter-compressor": 'Inverter compressor'
};
const WarrantyPeriodEnum = {
    "1-year": '1',
    "2-years": '2',
    "3-years": '3',
    "5-years": '5'
};

const RatingEnum = {
    "1-rating": '1',
    "2-rating": '2',
    "3-rating": '3',
    "4-rating": '4'
};


// const ReportType = [
//     { name: "Doctors Prescription", index: 0 },
//     { name: "Lab Reports", index: 1 },
//     { name: "Imaging", index: 2 },
//     { name: "Others Reports", index: 3 }
// ];

// function getIndexByReportType(name) {
//     const report = ReportType.find(report => report.name === name);
//     return report ? report.index : -1;
// }

module.exports = {
    randomFourDigitCode,
    getCountryCode,
    calculateAge,
    formatDate,
    formatDateFull,
    getDistanceFromLatLonInKm,
    generateRandomString,
    getFileSize,
    calculateSubscriptionEndDate,
    getZipCodeDetails,
    getZipcodeAndArea,
    UserRole,
    LoginTypeEnum,
    CapacityTypeEnum,
    RoomSizeEnum,
    AvailabilityEnum,
    CoolingCapacityEnum,
    WarrantyPeriodEnum,
    RatingEnum,
    constants: {
        OTP_EXPIRATION_SECONDS: 60,
    }
};
