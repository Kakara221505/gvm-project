const { async } = require('@firebase/util');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const countryList = require('country-list');
const { fn, col } = require('sequelize');


const OrganizationModel =require('../models/organization');
const OrganizationUserRelationModel = require('../models/OrganizationUserRelation');
const ShareModel = require('../models/Share');
const BobModel = require('../models/Bob');

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

//==========CONST================

const LoginTypeEnum = {
    EMAIL: '0',
    PHONE: '1'
};

const UserRole = {
    ADMIN: '0',
    USER: '1',
    ORGANIZATION:'2'
};
const OrgnizationRole = {
    Advance_User: '0',
    Basic_User: '1',
    External_User:'2',
    Admin:'3'
};

const Type = {
    SOLID: '0',
    IMAGES: '1',
    PDF:'2'
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


async function determineEditability(data, annotation) {
    try {
      // Check if the user is the project owner
      if (data.UserID === data.project.UserID) {
        return true;
      }
  
      if (data.loginUser.User_type === 2) {
        // Organization user logic
        return false;
      }
  
      // Fetch the share record
      const shareRecord = await ShareModel.findOne({
        where: { ProjectID: data.project.ID, Is_deleted: false },
        attributes: ["User_access"],
      });
  
      if (!shareRecord) {
        return false; // No share record found
      }
  
      const userAccess = shareRecord.User_access.find(
        (access) => access.UserID === data.loginUser.ID
      );
  
      if (!userAccess) {
        return false; // User does not have access
      }
  
      // Handle different user access types
      if (userAccess.Type === "view") return false;
      if (userAccess.Type === "admin") return true;
  
      if (userAccess.Type === "edit") {
        // Check user's organization
        const userOrg = await OrganizationUserRelationModel.findOne({
          where: { UserID: data.loginUser.ID, Is_deleted: false },
          attributes: ["OrganizationID"],
        });
  
        if (!userOrg) return false;
  
        const orgData = await OrganizationModel.findOne({
          where: { ID: userOrg.OrganizationID, Is_deleted: false },
          attributes: ["UserID"],
        });
  
        if (orgData && orgData.UserID === data.project.UserID) {
          return true;
        }
  
        if (annotation.UserID === data.loginUser.ID) {
          return true;
        }
  
        const annotationUserOrg = await OrganizationUserRelationModel.findOne({
          where: { UserID: annotation.UserID, Is_deleted: false },
          attributes: ["OrganizationID"],
        });
  
        if (!annotationUserOrg) return false;
  
        const annotationOrgData = await OrganizationModel.findOne({
          where: { ID: annotationUserOrg.OrganizationID, Is_deleted: false },
          attributes: ["UserID"],
        });
  
        return annotationOrgData && annotationOrgData.UserID === orgData.UserID;
      }
    } catch (err) {
      console.error("Error in determineEditability:", err.message || err);
      return false; // Default to non-editable on error
    }
  
    return false; // Default to non-editable
  }

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
    determineEditability,
    UserRole,
    LoginTypeEnum,
    OrgnizationRole,
    Type,
    constants: {
        OTP_EXPIRATION_SECONDS: 60,
    }
};
