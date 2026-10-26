const product = require("../data/product.model.js");


const createproduct = async (req, res) => {
    try {
        const { productname, email, sellerId, price, quantity } = req.body;


        if (!productname || !email || !sellerId || !price || !quantity) {


            return res.status(400).json({ message: "All fields are required" });
        }


        const newProduct = new product({
            productname,
            email,
            sellerId,

            
            price,
            quantity
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);



    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }   
}


const updateproduct = async (req, res) => {
    try {
        const { productname, email, sellerId, price, quantity } = req.body;
        const { id } = req.params;
        

        const updatedProduct = await product.findByIdAndUpdate(
            id,
            { productname, email, sellerId, price, quantity },
            { new: true }
        );



        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(updatedProduct);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const myproducts = async (req, res) => {
    try {
        const { sellerId } = req.params;

        const products = await product.find({ sellerId });

        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products found for this seller" });
        }

        res.status(200).json(products);

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }   


};


const deletemyproduct = async (req, res) => {
    try {
        const { id } = req.params;  

        const deletedProduct = await product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully" });



    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }


}

    

module.exports = {
    createproduct,
    updateproduct,
    myproducts,
    deletemyproduct
};