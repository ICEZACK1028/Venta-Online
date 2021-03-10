'use strict'

//Imports
const cartModel = require('../models/cart.model');
const productModel = require('../models/product.model');
const userModel = require('../models/user.model');

//Exportación

module.exports = {

    //Función para crer el carrito automáticamente
    createCart: function(idUser){
        var cartBuilder = new cartModel();
        cartBuilder.userId = idUser;
        cartBuilder.save();
    },

    //Función para crear y agregar producto
    agregateProduct: function(req,res){
        var params = req.body;
        var idProduct = params.productId;

        //Verificación del rol
        // if(req.params.rol != 'Cliente') return res.send({ '' })

                //Métodos para agregar productos al carrito
                productModel.findById(idProduct).exec((er, productFound)=>{
                    cartModel.findOneAndUpdate({userId: req.user.sub},
                        {$push: { productsBt: {
                            idProduct: idProduct,
                            amount: params.amount,
                            subTotal: productFound.price * params.amount
                        }}},{new: true, useFindAndModify: false}, (er, cartFound)=>{
                                if(er) return res.status(404).send({ mensaje: 'Error al agregar el producto' });
                            
                                return res.status(200).send(cartFound);
                            });
                });
    },

    //Función para editar el carrito de compras
    editCart: function(req, res){
    },

    //Función para eliminar producto del carrito de compras
    deleteCart: function(req,res){
    }
}























// var stock = productFound.stock;
// productModel.findByIdAndUpdate(idProduct, {stock: stock-params.amount}, (er, stockUpdated)=>{});