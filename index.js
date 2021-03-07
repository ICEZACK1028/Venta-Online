'use strict'

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const Users = require('./src/models/user.model');
const Categorys = require('./src/models/category.model');
const app = require('./app');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/VentaOnline', { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
    
    var User = new Users();
    var user = 'ADMIN';
    var password = '123456';
    var rol = 'Administrador';

    User.user = user;
    User.rol = rol;

    Users.find({user: User.user}).exec((er, userFound)=>{

        if(userFound && userFound.length >=1){
            return console.log('The Admin has already been created');
        }else{
            bcrypt.hash(password, null, null, (er, PassCrypt)=>{
                User.password = PassCrypt;

                User.save((er, UserSaved)=>{
                    if(er) return res.status(500).send({ mensaje: 'Error al guardar el usuario Maestro' });
                    if(UserSaved){
                        return console.log(UserSaved)
                    }else{
                        return console.log({ mensaje: 'No se ha podido registrar el Admin' });
                    }
                })
            })

        }
    })

    var Category = new Categorys();
    var name = 'default';
    var description = '';

    Category.name = name;
    Category.description = description;

    Categorys.find({ name: Category.name }).exec((er, categoryFound)=>{
        if(er) return res.status(500).send({ mensaje: '¡Error!' });

        if(categoryFound && categoryFound.length >=1){
            return console.log( 'Categorys already exist');
        }else{
            Category.save((er, categorySaved)=>{
                if(er) return res.status(500).send({ mensaje: 'Ha ocurrido un error'});

                if(categorySaved){
                    return console.log({ categorySaved });
                }else{
                    return console.log({ mensaje: 'No se ha podido crear la categoria ' });
                }
            });
        }
    });

    app.listen(3000, () => console.log('Server ready port: 3000... '));
    
}).catch(er => console.log(er));