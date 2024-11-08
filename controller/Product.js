const Product = require('../model/ProductModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Set up the upload directory and create it if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (jpeg, jpg, png, gif) are allowed.'));
    }
}

// Set up multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).fields([
    { name: 'imageUrl', maxCount: 1 },
]);

const multerUpload = (req, res) => {
    return new Promise((resolve, reject) => {
        upload(req, res, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

const product = async (req, res) => {
    const { name, slug, sku, price, category, quantity, description } = req.body;

    if (!name || !slug || !sku || !price || !category || !quantity || !description) {
        return res.status(400).json({ error: "All fields and an image are required" });
    }

    try {
        await multerUpload(req, res);
        
        console.log("Files:", req.files);
        console.log("Body:", req.body);

        const imageUrl = req.files['imageUrl'][0].path;

        const newProduct = await Product.create({
            name,
            slug,
            sku,
            price,
            category,
            quantity,
            description,
            imageUrl,
        });

        res.status(201).json({ message: "Product created successfully", product: newProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while creating the product." });
    }
};



const allProducts =  async(req, res) => {
    try {
        const products = await Product.find();
        return res.status(201).json(products);
    } catch (error) {
        console.error("Error retrieving Products:", error);
        res.status(500).json({ message: 'Failed to retrieve Products' });
    }
    
}

const singleProduct = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(200).json(product);
    } catch (error) {
        console.error("Error retrieving Product:", error);
        res.status(500).json({ message: 'Failed to retrieve Product' });
    }
}

const deleteSingleProduct = async(req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error("Error deleting Product:", error);
        res.status(500).json({ message: 'Failed to delete Product' });
    }
}

const updateSingleProduct = async(req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators:true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(200).json(product);
    } catch (error) {
        console.error("Error updating Product:", error);
        res.status(500).json({ message: 'Failed to update Product' });
    }
}



module.exports = {
  product,
  allProducts,
  singleProduct,
  deleteSingleProduct,
  updateSingleProduct,
};
