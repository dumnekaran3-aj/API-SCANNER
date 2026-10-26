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

const updateFileMetadata = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedFile = await File.findOneAndUpdate(
            { _id: id, uploadedBy: req.user._id },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedFile) {
            return res.status(404).json({ success: false, message: 'File not found or unauthorized' });
        }

        res.status(200).json({ success: true, data: updatedFile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteFileMetadata = async (req, res) => {
    try {
        const { id } = req.params;

        const file = await File.findOne({ _id: id, uploadedBy: req.user._id });

        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found or unauthorized' });
        }

      
        await file.deleteOne();

        res.status(200).json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    saveFileMetadata,
    updateFileMetadata,
    deleteFileMetadata
};