const express = require('express');
const router = express.Router();

const { users } = require('../data/data.js');


router.get('/users/:id', (req, res) => {
    try {
        
     const user = users.find(u => u.ID === req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const sanitizedUsers = [user].map(({ password, ...user }) => user);

        return res.status(200).json({
            success: true,


            count: sanitizedUsers.length,
            data: sanitizedUsers
        });

    } catch (error) {
        console.error("Error fetching users:", error.message);
        return res.status(500).json({ 


            success: false, 
            error: 'Failed to fetch users' 
        });
    }
});

module.exports = router;