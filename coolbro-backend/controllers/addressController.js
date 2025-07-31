const AddressModel = require('../models/address');
const UserDetailsModel = require('../models/userDetails');
const messages = require('../utils/messages');
const { Op } = require('sequelize');

// // Add Update Address
async function addUpdateAddress(req, res, next) {
    // #swagger.tags = ['Address']
    // #swagger.description = 'Add or update Address details'
    let { UserID, Nick_name, Company_name, GST_number, First_name, Last_name, Phone_number, Phone_number_2, Address, City, State, PostalCode, Country, isDefaultAddress, id } = req.body;
    try {
        let loginUser = req.user;
        if (!id) {
            // Check if the Address already exists
            const newAddress = await AddressModel.create({
                UserID,
                Nick_name,
                Company_name,
                GST_number,
                First_name,
                Last_name,
                Phone_number,
                Phone_number_2,
                Address,
                City,
                State,
                PostalCode,
                Country,
                Created_by: loginUser.ID
            });

            // Set isDefaultAddress flag
            if (isDefaultAddress === true) {
                // Update the DefaultAddressID in UserDetails
                await UserDetailsModel.update(
                    { DefaultAddressID: newAddress.ID },
                    { where: { UserID: newAddress.UserID } }
                );
            }

            return res.status(200).json({ addressId: newAddress.ID, message: messages.success.ADDRESS_CREATED, status: messages.success.STATUS });
        }
        else {
            // Find the existing Address record
            const existingAddress = await AddressModel.findByPk(id);
            if (!existingAddress) {
                return res.status(404).json({ message: messages.error.ADDRESS_NOT_FOUND, status: messages.error.STATUS, });
            }
            if(existingAddress){
            if (UserID) {
                existingAddress.UserID = UserID;
            }
            existingAddress.Company_name = Company_name !== undefined ? Company_name : existingAddress.Company_name;
            existingAddress.GST_number = GST_number !== undefined ? GST_number : existingAddress.GST_number;
            existingAddress.Nick_name = Nick_name !== undefined ? Nick_name : existingAddress.Nick_name;
            if (First_name) {
                existingAddress.First_name = First_name;
            }
            existingAddress.Last_name = Last_name !== undefined ? Last_name : existingAddress.Last_name;

            if (Phone_number) {
                existingAddress.Phone_number = Phone_number;
            }
            existingAddress.Phone_number_2 = Phone_number_2 !== undefined ? Phone_number_2 : existingAddress.Phone_number_2;
            if (Address) {
                existingAddress.Address = Address;
            }
            if (City) {
                existingAddress.City = City;
            }
            if (State) {
                existingAddress.State = State;
            }
            if (PostalCode) {
                existingAddress.PostalCode = PostalCode;
            }
            if (Country) {
                existingAddress.Country = Country;
            }
            console.log(existingAddress)
            existingAddress.Updated_by = loginUser.ID;
            // Save the updated details to database 
            
            if (existingAddress.changed()) {
            await existingAddress.save();
            }
        }
            // Set isDefaultAddress flag
            if (isDefaultAddress === true) {
                // Update the DefaultAddressID in UserDetails
                await UserDetailsModel.update(
                    { DefaultAddressID: existingAddress.ID },
                    { where: { UserID: existingAddress.UserID } }
                );
            }
        

            return res.status(200).json({ addressId: existingAddress.ID, message: messages.success.ADDRESS_UPDATE, status: messages.success.STATUS });
        }
    } catch (error) {
        return next(error);
    }

}


//getAddressBYUserID
async function getAddressByUserId(req, res, next) {
    // #swagger.tags = ['Address']
    // #swagger.description = 'Get Address by ID'
    try {
        const { UserID } = req.params;
        const address = await AddressModel.findAll({
            where: { UserID: UserID },
            attributes: { exclude: ['Created_at', 'Created_by', 'Updated_at', 'Updated_by'] }
        });

        if (!address || address.length === 0) {
            return res.status(404).json({ message: messages.error.ADDRESS_NOT_FOUND, status: messages.error.STATUS, });
        }

        const userDetails = await UserDetailsModel.findOne({
            where: { UserID: UserID },
            attributes: ['DefaultAddressID']
        });
        if (userDetails) {
            const defaultAddressID = userDetails.DefaultAddressID;
            address.forEach(addr => {
                addr.dataValues.isDefaultAddress = String(addr.ID) === String(defaultAddressID);
            });
        }
        return res.status(200).json({ data: address, status: messages.success.STATUS });
    } catch (error) {
        return next(error);
    }
}

//getAddressBYID
async function getAddressById(req, res, next) {
    // #swagger.tags = ['Address']
    // #swagger.description = 'Get Address by ID'
    try {
        const { id } = req.params;
        console.log("hii", id)
        const address = await AddressModel.findOne({
            where: { ID: id },
            attributes: { exclude: ['Created_at', 'Created_by', 'Updated_at', 'Updated_by'] }
        });

        if (!address) {
            return res.status(404).json({ message: messages.error.ADDRESS_NOT_FOUND, status: messages.error.STATUS, });
        }
        return res.status(200).json({ data: address, status: messages.success.STATUS });
    } catch (error) {
        return next(error);
    }

}
//deleteAddress

async function deleteAddress(req, res, next) {
    try {
        const { id } = req.params;
        const data = await AddressModel.findByPk(id);
        if (!data) {
            return res.status(404).json({ message: messages.error.ADDRESS_NOT_FOUND, status: messages.error.STATUS, });
        }
        await data.destroy();
        return res.status(200).json({ message: messages.success.Address_DELETED, status: messages.success.STATUS, });
    } catch (error) {
        return next(error);
    }
}


module.exports = {
    addUpdateAddress,
    getAddressByUserId,
    getAddressById,
    deleteAddress

};

