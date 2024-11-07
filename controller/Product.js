const Product = require('../model/ProductModel');


const product = async (req, res) => {
    const { name, slug, sku, price, category, quantity, description } = req.body;

    if (!name || !slug || !sku || !price || !category || !quantity || !description) {
        return res.status(400).json({ error: "All fields and an image are required" });
    }

    try {
       
        
        const newProduct = await Product.create({
            name,
            slug,
            sku,
            price,
            category,
            quantity,
            description,
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
