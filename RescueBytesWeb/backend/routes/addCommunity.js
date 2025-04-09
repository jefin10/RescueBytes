import Community from '../models/community.model.js';

export const addCommunity = async (req, res) => {
    try {
        const { name, phone, location, email } = req.body;

        if (!name || !phone || !location || !email) {
            return res.status(400).json({ 
                message: 'All fields are required' 
            });
        }

        const existingCommunity = await Community.findOne({ email });
        if (existingCommunity) {
            return res.status(409).json({ 
                message: 'A community with this email already exists' 
            });
        }

        const newCommunity = new Community({
            name,
            phone,
            location, 
            email
        });

        await newCommunity.save();

        res.status(201).json({
            message: 'Community registered successfully',
            community: {
                id: newCommunity._id,
                name: newCommunity.name,
                location: newCommunity.location
            }
        });

    } catch (error) {
        console.error('Community registration error:', error);
        res.status(500).json({ 
            message: 'Internal server error during community registration',
            error: error.message 
        });
    }
};