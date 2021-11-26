const Product = require("../../models/admin/Product");
const cloudinary = require("../../components/cloudinary");

module.exports = {
  // images are upload here
  prouctImageUploadLink: (images) => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = 0;
        let imageUrl = [];

        for (let image of images) {
          let cloudUpload = await cloudinary.uploader.upload(image.path, {
            upload_preset: "pezo4etc",
          });
          imageUrl.push({
            img: cloudUpload.secure_url,
          });
          count++;

          if (count === images.length) {
            resolve(imageUrl);
          }
        }
      } catch (e) {
        reject(e.message);
      }
    });
  },
  // add new product
  addNewProduct: (body) => {
    return new Promise(async (resolve, reject) => {
      try {
        let productSave = new Product({
          name: body.name,
          price: body.price,
          details: body.details,
          shortDescription: body.shortDescription,
          color: body.color,
          brand: body.color,
          category: body.category,
          subCategory: body.subCategory,
          quantity: body.quantity,
          productImages: body.productImages,
        });
        let saved = await productSave.save();
        resolve(saved);
      } catch (e) {
        reject(e.message);
      }
    });
  },

  // list all products
  listAllProducts: function (pageNum, categoryName,name, sort) {
    return new Promise(async (resolve, reject) => {

      try {
        let products = await Product.find({category:{$regex:categoryName}, name:{$regex:name, $options:"i"}})
          .sort({ createdAt: sort })
          .skip(pageNum * 10 - 10)
          .limit(pageNum * 10);
        let productLength = await Product.find({category:{$regex:categoryName}, name:{$regex:name, $options:"i"}}).count();
        resolve({ products, count: productLength });
      } catch (e) {
        reject(e.message);
      }
    });
  },

  // update product
  updateAProduct: (productId, body) => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = 0;
        Product.updateOne(
          { _id: productId },
          {
            $set: {
              name: body.name,
              price: body.price,
              details: body.details,
              shortDescription: body.shortDescription,
              color: body.color,
              brand: body.color,
              category: body.category,
              subCategory: body.subCategory,
              quantity: body.quantity,
            },
          }
        )
          .then(async (response) => {
            if (body.imageIds.length > 0) {
              let ids = body.imageIds;
              let images = body.productImages;

              for (let imageId of ids) {
                await Product.updateOne(
                  { _id: productId, "productImages._id": imageId },
                  {
                    $set: {
                      "productImages.$.img": images[count].img,
                    },
                  }
                );

                count++;
              }
              resolve(response);
            } else {
              resolve(response);
            }
          })
          .catch((err) => {
            reject(err);
          });
      } catch (e) {
        reject(e.message);
      }
    });
  },

  // delete products
  deleteProduct: function (productId) {
    return new Promise(async (resolve, reject) => {
      try {
        Product.deleteOne({ _id: productId })
          .then((response) => {
            resolve(response);
          })
          .catch((e) => {
            reject(e);
          });
      } catch (e) {
        reject(e.message);
      }
    });
  },

  // get one product details
  getOneProductDetails: (productId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let product = await Product.findOne({ _id: productId });

        resolve(product);
      } catch (er) {
        reject(er.message);
      }
    });
  },

  // filter products
  filterProducts: (categoryName, subCategory) => {
    return new Promise(async (resolve, reject) => {
      try {
        //if (!categoryName || !subCategory) reject("Not found");

        let products = await Product.find({
          category: categoryName,
        });
        let count = await Product.find({
          category: categoryName,
        }).count();
        resolve({ products, count });
      } catch (err) {
        reject(err.message);
      }
    });
  },
};
