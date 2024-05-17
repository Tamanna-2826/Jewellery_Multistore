
const { City, State } = require('../models');

const getCities = async (req, res) => {
  try {
    const { state_id } = req.params;
  
    const cities = await City.findAll({
        where: { state_id }, 
     });
    res.status(200).json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getStates = async (req, res) => {
  try {
    const states = await State.findAll();
    res.status(200).json(states);
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getCities, getStates };
