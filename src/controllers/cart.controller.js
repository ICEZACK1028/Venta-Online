'use strict'

//Imports
const cartModel = require('../models/cart.model');
const productModel = require('../models/product.model');
const userModel = require('../models/user.model');

//Exportación

module.exports = {

    //Función para crer el carrito automáticamente al crear el usuario
    createCart: function(idUser){
        var cartBuilder = new cartModel();
        cartBuilder.userId = idUser;
        cartBuilder.total = 0;
        cartBuilder.save();
    },

    //Función para crear y agregar producto
    agregateProduct: function(req,res){
        var params = req.body;
        var idProduct = params.productId;

        //Verificación del cliente
        //if(req.params.rol != 'Cliente') return res.send({ mensaje: 'Eres admin, deja a los mortales comprar' })

        //Buscamos el producto que le enviamos en nuestro producto
        productModel.findById(idProduct).exec((er, productFound)=>{
            if(er) return res.status(500).send({ mensaje: 'Un error ha aterrizado' });
            //Función para buscar el producto dentro del carrito
            cartModel.findOne({ userId: req.user.sub, "productsBt.idProduct": idProduct }, (er, productExisting)=>{
                if(er) return res.status(500).send({ mensaje: 'UPss hemos tenido un incoveniente' });
                if(productFound.stock == 0) return res.status(500).send({ mensaje: 'Producto agotado...' });
                if(productFound.stock < params.amount) return res.status(500).send({ mensaje: `No hay productos suficientes. Existencias disponibles: ${productFound.stock}` });    

                //Convertimos el campo cantidad a un integer y guardamos el la multiplicación para el totalS
                var IntAmount = parseInt(params.amount, 10);
                var subTotalFinal = IntAmount * productFound.price;
                
                if(!productExisting){
                    
                    //Métodos para agregar productos al carrito
                    cartModel.findOneAndUpdate({userId: req.user.sub},
                        {$push: { productsBt: {
                            idProduct: idProduct,
                            amount: IntAmount,
                            price: productFound.price,
                            subTotal: productFound.price * IntAmount
                        }}},{new: true, useFindAndModify: false}, (er, cartFound)=>{
                            if(er) return res.status(404).send({ mensaje: 'Error al agregar el producto' });
                            if(!cartFound) return res.status(500).send({ mensaje: 'Este usuario no tiene carrito :) (Es porque está logueado con el ADMIN)' });
                            
                             cartModel.findOneAndUpdate({ userId: req.user.sub, "productsBt.idProduct": idProduct },{ total: cartFound.total + (productFound.price * IntAmount)}, 
                             { new: true, useFindAndModify: false }, (er, cartUpdated)=>{
                                return res.status(200).send({cartUpdated});
                             }); 
                        });
                        
                    }else{
                        //Verificamos que encuentre el producto que le estamos enviando en nuestro carrito, para sumarle la cantidad a la que ya tenemos
                        var productArray = productExisting.productsBt;
                        for(var step=0; step<productArray.length; step++){
                            var idProductArray = productArray[step].idProduct;
                            var amountArray =  productArray[step].amount;
                            var subTotalArray =  productArray[step].subTotal;                        
                            
                            if(idProductArray == idProduct){
                                //Verificamos la suma de la cantidad del producto agregada y la cantidad que queremos agregar ahora, y verificamos que no sobrepase a la cantidad en stock;
                                var amountTotal = amountArray + IntAmount;
                                var amountAggregate =  productFound.stock - amountArray;
                                if(amountTotal > productFound.stock ) return res.status(500).send({ mensaje: `Ya tiene ${amountArray} productos agregados, solo podría agregar ${amountAggregate} más. Stock del producto: ${productFound.stock}` });
                                //Actualizamos la cantidad y el subtotal
                                cartModel.findOneAndUpdate({ userId: req.user.sub, "productsBt.idProduct": idProduct }, {"productsBt.$.amount": amountArray+IntAmount, 
                                    "productsBt.$.subTotal": subTotalArray + subTotalFinal  }, (er, productUpdated)=>{
                                        //Finalmente, le sumamos el subtotal al total
                                        cartModel.findOneAndUpdate({ userId: req.user.sub, "productsBt.idProduct": idProduct },{ total: productUpdated.total + (subTotalFinal)}, 
                                        { new: true, useFindAndModify: false }, (er, cartUpdated)=>{
                                        return res.status(200).send({cartUpdated});
                                        }); 
                                })
                            }
                        };
                    }
                });
            });
    },
}
















