'use strict'

//Imports 
const categoryModel = require('../models/category.model');
const productModel = require('../models/product.model');


    //Función para crear categorias
    function createCategory(req, res){
        var categoryBuilder = new categoryModel() ;
        var params = req.body;

        if(req.user.rol != 'Administrador') return res.status(500).send({ mensaje: 'Solamente los administradores pueden crear categorias' });

        if(params.name){
            categoryBuilder.name = params.name;
            categoryBuilder.description = params.description;

            categoryModel.find({ name: categoryBuilder.name}).exec((er, categoryFound)=>{
                if(er) return res.status(500).send({ mensaje: 'Upss hemos encontrado un error en el proceso'});

                if(categoryFound && categoryFound.length >=1){
                    return res.status(500).send({ mensaje: `El nombre de categoria '${params.name}' ya está en uso. Prueba con otro` });
                }else{
                    categoryBuilder.save((er, categorySaved)=>{
                        if(er) return res.status(500).send({ mensaje: 'Ha ocurrido un error :/' });

                        if(categorySaved){
                            return res.status(200).send({ 'Categoria guardada': categorySaved });
                        }else{
                            return res.status(500).send({ mensaje: 'No se ha podido guardar la categoria'});
                        }
                    })
                }
            });

        }else{
            return res.status(500).send({ mensaje: `Debe rellenar al menos el campo 'name' ` });
        }
    }

    //Función para crear la categoria por defecto
    function createCategoryDefault(){
        var Category = new categoryModel();
        var name = 'default';
        var description = '';

        Category.name = name;
        Category.description = description;

        categoryModel.find({ name: Category.name }).exec((er, categoryFound)=>{
            if(er) console.log({ mensaje: '¡Error!' });

            if(categoryFound && categoryFound.length >=1){
            }else{
                Category.save((er, categorySaved)=>{
                    if(er) console.log({ mensaje: 'Ha ocurrido un error'});

                    if(categorySaved){
                        console.log({ categorySaved });
                    }else{
                        console.log({ mensaje: 'No se ha podido crear la categoria ' });
                    }
                });
            }
        });
    }

    //Función para listar categorias
    function listCategorys(req,res){

        //Verificar si el usuario logueado es administrador
        if(req.user.rol != 'Administrador') return res.status(500).send({ mensaje: 'Solo los administradores tienen permisos para esta acción'}); 

        categoryModel.find((er,categoryFound)=>{
            if(er) return res.status(500).send({ mensaje: 'Lo sentimos :( hemos encontrado un error' });
            if(!categoryFound) return res.status(500).send({ mensaje: 'No hemos podido encontrar las categorias' });

            return res.status(500).send({ 'Categorias encontradas': categoryFound });
        })
    }

    //Función para editar categorias
    function editCategory(req,res){
        var idCategory = req.params.idCategory;
        var params = req.body;

        //Verificamos que el usuario logueado sea un administrador
        if(req.user.rol != 'Administrador') return res.status(500).send({ mensaje: 'solo el administrador puede editar una categoria' });

        categoryModel.findByIdAndUpdate(idCategory, params, { new: true, useFindAndModify: false }, (er, categoryFound)=>{
            if(er) return res.status(500).send({ mensaje: 'Vaya... hemos fallado en algo, ha ocurrido un error' });
            if(!categoryModel) return res.status(500).send({ mensaje: 'No hemos podido encontrar la categoria con este id, revisalo' });

            return res.status(200).send({ 'Categoria actualizada correctamente': categoryFound });
        })
    }

    //Función para eliminar categorias
    function deleteCategory(req,res){
        var idCategory = req.params.idCategory;
        
        //Verificación para rol administrador
        if(req.user.rol != 'Administrador') return res.status(500).send({ mensaje: 'Únicamente los administradores pueden realizar esta acción' });
        createCategoryDefault();

        //Buscar la categoria por default
        categoryModel.findOne({ name: "default" }, (er, cDefaultFound)=>{
            //Método para eliminar la categoria
            categoryModel.findByIdAndDelete(idCategory, (er, categoryDeleted)=>{
                if(er) return res.status(500).send({ mensaje: 'Ha ocurrido un error en el sistema' });
                if(!categoryDeleted) return res.status(500).send({ mensaje: 'Perdón, no hemos podido ninguna categoria con ese id, revísalo' });
                //Buscamos los productos que colleven la categoria eliminada
                productModel.find({ categoryId : idCategory }).exec((er, productsFound)=>{
                    productsFound.forEach((categoryDefault)=>{
                        productModel.findByIdAndUpdate(categoryDefault._id, { categoryId: cDefaultFound }, (er, updated)=>{
                        });
                    });
                });
                //Mostramos la categoria eliminada
                return res.status(200).send({ 'Categoria eliminada' : categoryDeleted  });
            }); 
        });
    }

module.exports ={
    createCategory,
    listCategorys,
    editCategory,
    deleteCategory
}

 