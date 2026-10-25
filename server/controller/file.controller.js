
const File = require('../models/file.model');


const saveFileMetadata = async (req, res) => {
    try {
       
        
        const newFile = await File.create({

            originalname: req.file.originalname,

            key: req.file.key, 

            mimetype: req.file.mimetype,
            size: req.file.size,           

            url: req.file.location,       
            uploadedBy: req.user._id,   

            status: 'temporary'
        });

        res.status(201).json({ success: true, data: newFile });
    } catch (error) {

        res.status(500).json({ success: false, message: error.message });
    }
};