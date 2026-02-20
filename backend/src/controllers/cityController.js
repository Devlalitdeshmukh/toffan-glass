const City = require('../models/City');

const getAllCities = async (req, res) => {
    try {
        const cities = await City.getAll();
        res.json({
            message: 'Cities retrieved successfully',
            cities
        });
    } catch (error) {
        console.error('Get all cities error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve cities',
            message: error.message 
        });
    }
};

const getCityById = async (req, res) => {
    try {
        const { id } = req.params;
        const city = await City.getById(id);
        
        if (!city) {
            return res.status(404).json({ error: 'City not found' });
        }
        
        res.json({
            message: 'City retrieved successfully',
            city
        });
    } catch (error) {
        console.error('Get city by ID error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve city',
            message: error.message 
        });
    }
};

const createCity = async (req, res) => {
    try {
        const { name, state, country } = req.body;
        
        // Validation
        if (!name || !state) {
            return res.status(400).json({ 
                error: 'City name and state are required' 
            });
        }
        
        // Check if city already exists
        const existingCities = await City.getAll();
        const cityExists = existingCities.some(city => 
            city.name.toLowerCase() === name.toLowerCase()
        );
        
        if (cityExists) {
            return res.status(400).json({ 
                error: 'City already exists' 
            });
        }
        
        const cityId = await City.create({
            name,
            state,
            country: country || 'India'
        });
        
        const newCity = await City.getById(cityId);
        
        res.status(201).json({
            message: 'City created successfully',
            city: newCity
        });
    } catch (error) {
        console.error('Create city error:', error);
        res.status(500).json({ 
            error: 'Failed to create city',
            message: error.message 
        });
    }
};

const updateCity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, state, country } = req.body;
        
        // Check if city exists
        const existingCity = await City.getById(id);
        if (!existingCity) {
            return res.status(404).json({ error: 'City not found' });
        }
        
        // Check if new name already exists (excluding current city)
        if (name) {
            const existingCities = await City.getAll();
            const cityExists = existingCities.some(city => 
                city.name.toLowerCase() === name.toLowerCase() && city.id !== parseInt(id)
            );
            
            if (cityExists) {
                return res.status(400).json({ 
                    error: 'City name already exists' 
                });
            }
        }
        
        const updated = await City.update(id, {
            name,
            state,
            country
        });
        
        if (!updated) {
            return res.status(400).json({ error: 'Failed to update city' });
        }
        
        const updatedCity = await City.getById(id);
        
        res.json({
            message: 'City updated successfully',
            city: updatedCity
        });
    } catch (error) {
        console.error('Update city error:', error);
        res.status(500).json({ 
            error: 'Failed to update city',
            message: error.message 
        });
    }
};

const deleteCity = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deleted = await City.delete(id);
        
        if (!deleted) {
            return res.status(404).json({ error: 'City not found' });
        }
        
        res.json({
            message: 'City deleted successfully'
        });
    } catch (error) {
        console.error('Delete city error:', error);
        res.status(500).json({ 
            error: 'Failed to delete city',
            message: error.message 
        });
    }
};

module.exports = {
    getAllCities,
    getCityById,
    createCity,
    updateCity,
    deleteCity
};