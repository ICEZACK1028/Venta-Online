'use strict'

//Imports
const productModel = require('../models/product.model');

//Export functions
module.exports = {

    //Función para crear productos
    createProduct: function(req,res){
        var productBuilder = new productModel();
        var idCategory = req.params.idCategory;
        var params = req.body;

        //Verificamos que sea un usuario administrador
        if(req.user.rol != 'Administrador') return res.status(500).send({ mensaje: 'Solo los administradores pueden agregar productos' });

        //Evaluamos que se llenen todos los campos
        if(params.name && params.price && params.stock && idCategory){
            productBuilder.name = params.name;
            productBuilder.stock = params.stock;
            productBuilder.price = params.price;
            productBuilder.categoryId = idCategory;

            productModel.find({ name: productBuilder.name }).exec((er, productFound)=>{
                if(er) return res.status(500).send({ mensaje: 'Vaya... hemos encontrado un error' });
                
                if(productFound && productFound.length >=1){
                    return res.status(500).send({ mensaje: 'Ya existe un producto con el mismo nombre' });
                }else{
                productBuilder.save((er, newProduct)=>{
                    if(newProduct){
                        return res.status(200).send({ 'Nuevo producto' : newProduct });
                    }else{
                        return res.status(500).send({ mensaje: 'No hemos podido guardar el producto' });
                    }
                });
                }
            })
            }else{
                return res.status(500).send({ mensaje: 'Debe llenar todos los campos para crear el producto' });
            }
        },
        
    //Función para editar productos
    updateProduct: function(req,res){
        var idProduct = req.params.idProduct;
        var params = req.body;

        //Validación de usuario administrador
        if(req.user.rol != 'Administrador') return res.status(500).send({ mensaje: 'No posee los permisos necesarios para realizar esta acción' });

        productModel.findByIdAndUpdate(idProduct, params, {new: true, useFindAndModify: false}, (er, productUpdated)=>{
            if(er) return res.status(500).send({ mensaje: 'Ha ocurrido un error' });
            if(!productUpdated) return res.status(500).send({ mensaje: 'No se ha encontrado el id de este producto' });

            return res.status(200).send({ 'mensaje': productUpdated });
        });
    },

    //Función para buscar productos por id
    readProductId: function(req,res){
        var idProduct = req.params.idProduct;
        var params = req.body;

        productModel.findById(idProduct).exec((er, productFound)=>{
            if(er) return res.status(500).send({ mensaje: 'SOS ¡Un error!' });
            if(!productFound) return res.status(500).send({ mensaje: 'No se ha encontrado ningún producto con ese id' });

            return res.status(200).send({ 'Producto encontrado': productFound });
        });
    },

    //Función para visualizar todos los productos
    readProducts: function(req,res){
        
        //Verificar si es administrador
        if(req.user.rol != 'Administrador') return res.status(500).send({ mensaje: 'Solo los administradores pueden ver los productos' });

        //método para buscarlo todo
        productModel.find((er, productsFounds)=>{
            if(er) return res.status(500).send({ mensaje: 'Tenemos un incoveniente, hay un error' });
            if(!productsFounds) return res.status(500).send({ mensaje: 'No hemos podido encontrar los productos' });

            return res.status(200).send({'Productos existentes': productsFounds });
        })
    },

    //Función para eliminar producto
    deleteProduct: function(req,res){
        var idProduct = req.params.idProduct;
        var params = req.body;

        //Verificación que sea un administrador
        if(req.user.rol != 'Administrador') return res.status(500).send({ mensaje: 'Solo los administradores pueden eliminar productos' });

        productModel.findOneAndDelete({_id: idProduct }, (er,productDeleted)=>{
            if(er) return res.status(500).send({ mensaje: 'Ha surgido un error' });
            if(!productDeleted) return res.status(500).send({ mensaje: 'No se ha encontrado ningún producto con ese id' });

            return res.status(200).send({ 'Producto eliminado': productDeleted });
        });
    }

}