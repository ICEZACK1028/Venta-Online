'use strict'

//Imports
const userModel = require('../models/user.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');

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
                    if(params.getToken === 'true'){
                        return res.status(200).send({
                            Token: jwt.createToken(userFound)
                        });
                    }else{
                        userFound.password = undefined;
                        return res.status(200).send({ userFound });
                    }
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

    if(req.user.rol != 'Administrador') return res.status(500).send({ mensaje: 'Debes solicitar el rol administrador para realizar esta acción' });

    if(params.user && params.password){
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
                            res.status(300).send(userSaved);
                        }else{
                            res.status(404).send({ mensaje: 'No se ha podido crear el usuario' });
                        }
                    })
                })
            }
        })
    }
},

//Función para editar rol de usuarios:
updateRol: function(req, res){
    var idUser = req.params.idUser;
    var params = req.body;

    //Que solo pueda editar el rol
    delete params.user;
    delete params.password;

    //Para verificar que sea rol administrador

    userModel.findByIdAndUpdate(idUser, params, {new: true, useFindAndModify: false}, (er, userUpdated)=>{
        if(er) return res.status(500).send({ mensaje: 'Ha ocurrido un error' });
        if(!userUpdated) return res.status(500).send({ mensaje: 'No se ha podido encontrar este usuario, revisa el id' });
        //Verificar que el usuario tenga rol cliente
        if(userUpdated.rol != 'Cliente') return res.status(500).send({ mensaje: 'No puedes actualizar el rol de un administrador' });
        return res.status(500).send({ 'Usuario con nuevo rol': userUpdated });
    });
},

//Función para editar usuarios:
editUser: function(req, res){
    var idUser = req.params.idUser;
    var params = req.body;

    //Evita el campo password
    delete params.password;

    //Evitar si es de rol administrador
    if(req.user.rol != 'Administrador') return res.status(500).send({ mensaje: 'Únicamente el Administrador puede editar a los clientes' });

    userModel.findByIdAndUpdate(idUser, params, {new: true, useFindAndModify: false}, (er, userUpdated)=>{
        if(er) return res.status(500).send({ mensaje: 'Error en la petición' });
        if(!userUpdated) return res.status(500).send({ mensaje: 'No se ha podido actualizar el usuario' });
        return res.status(200).send({ 'Usuario actualizado' : userUpdated });
    });

},

//Función para eliminar usuarios:
deleteUser: function(req, res){
    var idUser = req.params.idUser;

    //Verificar si es rol administrador
    if(req.user.rol != 'Administrador') return res.status(500).send({ mensaje: 'Solo el administrador puede eliminar clientes' });

    userModel.findByIdAndDelete(idUser, (er, userDeleted)=>{
        if(er) return res.status(500).send({ mensaje: 'Upss, algo mal ha sucedido :(' });
        if(!userDeleted) return res.status(500).send({ mensaje: 'El id es incorrecto' });
        return res.status(200).send({ 'Usuario eliminado': userDeleted });
    })
}

}

