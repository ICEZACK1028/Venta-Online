'use strict'

//Imports
const userModel = require('../models/user.model');
const cartController = require('../controllers/cart.controller');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');
const categoryModel = require('../models/category.model');
const productModel = require('../models/product.model');
const billModel = require('../models/bill.model');

//Exportamos las funciones
module.exports = {

//FUNCTIONS

//Función para registrar:
registryUser: function(req, res){
    var userBuilder = new userModel();
    var params = req.body;
    
    userBuilder.user = params.user;
    userBuilder.rol = 'Cliente';

    userModel.find({ user: userBuilder.user }).exec((er, userFound)=>{
        if(er) return res.status(500).send({ mensaje: 'Ha ocurrido un error' });

        if(userFound && userFound.length >=1){
            return res.status(500).send({ mensaje: `El usuario '${params.user}' ya está en uso. Prueba con otro` });
        }else{
            bcrypt.hash(params.password, null, null, (er, PassCrypt)=>{
                userBuilder.password = PassCrypt;

                userBuilder.save((er, userSaved)=>{
                    if(userSaved){
                        cartController.createCart(userSaved._id);
                        res.status(500).send({ 'Usuario guardado': userSaved });
                    }else{
                        res.status(500).send({ mensaje: 'No se ha podido registrar el usuario' });  
                    }
                });
            });
        }
    });
},

//Función para loguearse:
login: function(req,res){
    var params = req.body;

    userModel.findOne({user: params.user }, (er,userFound)=>{
        if(er) return res.status(500).send({ mensaje: 'Ha ocurrido un error en la petición' });
        if(userFound){
           bcrypt.compare(params.password, userFound.password, (er, PassCrypt)=>{
               if(PassCrypt){
                    billModel.find({ userIdBill: userFound._id },{userIdBill:0, __v:0},(er, billFounds )=>{
                       if(params.getToken === 'true'){
                           return res.status(200).send({
                               Token: jwt.createToken(userFound),
                                'Bills': billFounds
                           });
                       }else{
                           userFound.password = undefined;
                           return res.status(200).send({ userFound });
                       }
                    });
               }else{
                   return res.status(500).send({ mensaje: 'El usuario no se ha podido identificar' });
               }
           });
        }else{
            return res.status(500).send({ mensaje: 'Usuario o contraseña malo, vuelva a intentarlo'});
        }
    })
},

//Función para crear usuarios:
createUser: function(req, res){
    var userBuilder = new userModel();
    var params = req.body;

    //Verificar si es administrador
    if(req.user.rol != 'Administrador') return res.status(500).send({ mensaje: 'Debes solicitar el rol administrador para realizar esta acción' });

    if(params.user && params.password){
        //Verificación para que solo se pueda agregar rol administrador y cliente
        if(params.rol != 'Administrador' && params.rol != 'Cliente' ) return res.status(500).send({ mensaje: `Únicamente puedes agregar el rol 'Administrador' o 'Cliente'` });
        
        userBuilder.user = params.user;
        userBuilder.rol = params.rol;

        userModel.find( 
                { user: userBuilder.user },
                { rol: userBuilder.rol } 
        ).exec((er, userFound)=>{
            if(er) return res.status(500).send({ mensaje: 'Ha ocurrido un error' });

            if(userFound && userFound.length >=1){
                return res.status(500).send({ mensaje: `El usuario '${params.user}' ya está en uso. Prueba con otro` });
            }else{
                bcrypt.hash(params.password, null, null, (er, PassCrypt)=>{
                    userBuilder.password = PassCrypt;

                    userBuilder.save((er, userSaved)=>{
                        if(er) return res.status(500).send({ mensaje: 'error al guardar el usuario' });

                        if(userSaved){
                            cartController.createCart(userSaved._id);
                            res.status(200).send(userSaved);
                        }else{
                            res.status(404).send({ mensaje: 'No se ha podido crear el usuario' });
                        }
                    })
                })
            }
        })
    }else{
        return res.status(500).send({ mensaje: `Debe rellenar los campos de 'user' y 'password' ` });
    }
},

//Función para editar rol de usuarios:
updateRol: function(req, res){
    var idUser = req.params.idUser;
    var params = req.body;

    //Para verificar que sea rol administrador
    if(req.user.rol != 'Administrador') return res.status(500).send({ mensaje: 'Solo los administradores puede actualizar los roles' });

    userModel.findOneAndUpdate({_id : idUser, rol: 'Cliente'},{ rol: params.rol }, {new: true, useFindAndModify: false}, (er, userUpdated)=>{
        if(params.rol != 'Administrador') return res.status(500).send({ mensaje: `Únicamente puedes ascender al usuario utilizando el rol 'Administrador'` });
        if(!params.rol) return res.status(500).send({ mensaje: 'Debe rellenar el campo rol' });
        if(er) return res.status(500).send({ mensaje: 'Ha ocurrido un error' });
        if(!userUpdated) return res.status(500).send({ mensaje: 'No se ha encontrado este usuario y / o este usuario es administrador' });

        return res.status(200).send({ 'Usuario con nuevo rol': userUpdated });
    });
},

//Función para eliminar rol de usuarios cliente:
deleteUserClient: function(req, res){
    var idUser = req.params.idUser;

    //Para verificar que sea rol administrador
    if(req.user.rol != 'Administrador') return res.status(500).send({ mensaje: 'Solo los administradores pueden eliminar clientes'});

    //Buscamos el usuario cliente a eliminar
    userModel.findOneAndDelete({_id : idUser, rol: 'Cliente'},(er, userDeleted)=>{
        if(er) return res.status(500).send({ mensaje: 'Ha sucedido algo mal' });
        if(!userDeleted) return res.status(500).send({ mensaje: 'No se ha encontrado este usuario y / o este usuario es administrador' });

        return res.status(200).send({ 'Usuario eliminado': userDeleted });
    })
},

//Función para editar usuarios cliente:
editUserClient: function(req, res){
    var idUser = req.params.idUser;
    var params = req.body;

    //Evitar si es de rol administrador
    if(req.user.rol != 'Administrador') return res.status(500).send({ mensaje: 'Únicamente el Administrador puede editar a los clientes' });

    //Buscamos el usuario cliente a editar
    userModel.findOneAndUpdate({_id : idUser, rol: 'Cliente'},{user: params.user},{new:true, useFindAndModify:false},(er, userUpdated)=>{
        if(er) return res.status(500).send({ mensaje: 'Ha sucedido algo mal' });
        if(!userUpdated) return res.status(500).send({ mensaje: 'No se ha encontrado este usuario y / o este usuario es administrador' });

        return res.status(200).send({ 'Usuario eliminado': userUpdated });
    })
},

//Función para ver los productos más vendidos:
mostSoldProducts: function(req,res){
    //Buscamos los productos 
    productModel.find((er,productsFound)=>{
        if(er) return res.status(500).send({ mensaje: 'Error en la petición' });
        if(!productsFound) return res.status(500).send({ mensaje: 'No hemos encontrado los productos' })

        return res.status(200).send({ productsFound });
    }).sort({sold:-1});
},

//Función para buscar productos por nombre:
searchProductsName: function(req,res){
    var params = req.body;
    var name =  params.name;

    //Verificar que tenga el rol cliente
    //if(req.user.rol != 'Cliente') return res.status(500).send({ mensaje: 'Esta función es para los clientes, siendo administrador no es necesaria para ti' });

    //Función para buscar productos por nombre por nombre
    productModel.findOne({name: name}, (er, productFound)=>{
        if(er) return res.status(500).send({ mensaje: 'Oh Oh Un obstáculo' });
        if(!productFound) return res.status(500).send({ mensaje: 'Vaya... no hemos encontrado ningún producto por ese nombre' });

        return res.status(200).send({ 'Producto': productFound });
    })
},

//Función para ver las categorías existentes: 
searchCategory: function(req,res){

    //Verificar que tenga el rol cliente
    //if(req.user.rol != 'Cliente') return res.status(500).send({ mensaje: 'Esta función es para los clientes, siendo administrador no es necesaria para ti' });

    categoryModel.find( (er, categoryFound)=>{
        if(er) return res.status(500).send({ mensaje: 'Hemos encontrado un error' });
        if(!categoryFound) return res.status(500).send({ mensaje: `No existen categorias` });

        return res.status(200).send({ 'Categoria encontrada': categoryFound });
    })
},

//Función para ver los productos de cierta categoria:
searchProductsCategory: function (req,res){
    var params = req.body;
    var categoryId = params.categoryId;
    
    categoryModel.findById(categoryId).exec((er,categoryFound)=>{
        if(er) return res.status(500).send({ mensaje: 'Ha surgido un error' });
        if(!categoryFound) return res.status(500).send({ mensaje: 'El id de la categoria no existe'});
        productModel.find({ categoryId: categoryId }, (er, productsFound)=>{
            if(er) return res.status(500).send({ mensaje: 'Nos ha saltado un error' });
            if(!productsFound) return res.status(500).send({ mensaje: 'No hay productos en esa categoria' });

            return res.status(200).send({ 'Productos de la categoria': productsFound });
        });
    });
},

//Función para editar su perfil:
editUser: function(req,res){
    var params = req.body;
    var idUser = req.user.sub;

    //Evitamos el campo password y rol
    delete params.rol;
    delete params.password;

    //Buscamos el usuario de la persona logueada
    userModel.findByIdAndUpdate(idUser, params, {new: true, useFindAndModify: false}, (er, userUpdated)=>{
        if(er) return res.status(500).send({ mensaje: 'Se nos ha complicado, hay un error :(' });
        if(!userUpdated) return res.status(500).send({ mensaje: 'No hemos podido guardar el usuario' });

        return res.status(200).send({ 'Haz actualizado tu perfil con éxito': userUpdated });
    })
},

//Función para eliminar su perfil:
deleteUser: function(req,res){
    var params = req.body;
    var idUser = req.user.sub;

    //Buscamos el id del usuario y lo eliminé
    userModel.findByIdAndDelete(idUser, (er, userFound)=>{
        if(er) return res.status(500).send({ mensaje: 'Error en la solicitud' });
        if(!userFound) return res.status(500).send({ mensaje: 'No se ha podido eliminar el usuario' });

        return res.status(200).send({ 'Haz eliminado tu cuenta con éxito': userFound });
    });
}

}

