const { Address, City, State } = require("../models");

const addShippingAddress = async (req, res) => {
  try {
    const {
      user_id,
      first_name,
      last_name,
      phone_no,
      street_address,
      city_id,
      state_id,
      pincode,
    } = req.body;

    const newAddress = await Address.create({
      user_id,
      first_name,
      last_name,
      phone_no,
      street_address,
      city_id,
      state_id,
      pincode,
      country: "India",
      address_type: "shipping",
      is_default: false,
    });

    const cityExists = await City.findByPk(city_id);
    const stateExists = await State.findByPk(state_id);

    if (!cityExists || !stateExists) {
      return res.status(400).json({ error: "Invalid city_id or state_id" });
    }

    res.status(200).json({
      message: "Shipping address added successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error("Error adding shipping address:", error);
    res.status(500).json({ error: "Failed to add shipping address" });
  }
};

const addBillingAddress = async (req, res) => {
  try {
    const {
      user_id,
      first_name,
      last_name,
      phone_no,
      street_address,
      city_id,
      state_id,
      pincode,
    } = req.body;

    const shippingAddressExists = await Address.findOne({
      where: {
        user_id,
        address_type: "shipping",
      },
    });


    if (!shippingAddressExists) {
      return res.status(400).json({
        error:
          "User must have at least one shipping address before adding a billing address",
      });
    }
    await shippingAddressExists.update({ is_default: false });

    const newAddress = await Address.create({
      user_id,
      first_name,
      last_name,
      phone_no,
      street_address,
      city_id,
      state_id,
      pincode,
      country: "India",
      address_type: "billing",
      is_default: false,
    });

    const cityExists = await City.findByPk(city_id);
    const stateExists = await State.findByPk(state_id);

    if (!cityExists || !stateExists) {
      return res.status(400).json({ error: "Invalid city_id or state_id" });
    }

    res.status(200).json({
      message: "Billing address added successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error("Error adding billing address:", error);
    res.status(500).json({ error: "Failed to add billing address" });
  }
};

const updateDefaultAddress = async (req, res) => {
  try {
    const { address_id } = req.params;
    const { user_id } = req.body;

    const addressToUpdate = await Address.findOne({
      where: {
        address_id,
        user_id,
      },
      include: [{ model: City, as: 'city' }, { model: State, as: 'state' }],

    });

    if (!addressToUpdate) {
      return res.status(404).json({ error: "Address not found" });
    }

    await addressToUpdate.update({ is_default: true });

    res.status(200).json({
      message: "Address updated successfully",
      address: addressToUpdate,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ error: "Failed to update address" });
  }
};

const getAddresses = async (req, res) => {
  try {
    const { user_id } = req.params;

    const addresses = await Address.findAll({
      where: {
        user_id,
      },
      include: [{ model: City, as: 'city' }, { model: State, as: 'state' }],

    });

    if (!addresses.length) {
      return res
        .status(404)
        .json({ error: "No addresses found for the specified user_id" });
    }

    let hasDefaultShippingAddress = false;
    addresses.forEach((address) => {
      if (address.is_default) {
        hasDefaultShippingAddress = true;
        return;
      }
    });

    if (hasDefaultShippingAddress) {
      const shippingAddresses = addresses.filter(
        (address) => address.address_type === "shipping"
      );
      return res.status(200).json({ shippingAddresses });
    } else {
      const shippingAddresses = addresses.filter(
        (address) => address.address_type === "shipping"
      );
      const billingAddresses = addresses.filter(
        (address) => address.address_type === "billing"
      );
      return res.status(200).json({ shippingAddresses, billingAddresses });
    }
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
};

module.exports = {
  addShippingAddress,
  addBillingAddress,
  updateDefaultAddress,
  getAddresses,
};
