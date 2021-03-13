'use strict'

//Imports 
const billModel = require('../models/bill.model');
const cartController = require('../controllers/cart.controller');
const productModel = require('../models/product.model');
const cartModel = require('../models/cart.model');
const PDF = require('html-pdf');
const userModel = require('../models/user.model');

module.exports = {
    
    //Función para crear el carrito
    createBill: function(req,res){
        var billBuilder = new billModel(); 

            //Buscamos el id del carrito del usuario logueado
            cartModel.findOne({ userId: req.user.sub },(er, cartFound)=>{
                if(er) return res.status(500).send({ mensaje: 'Lo siento, hemos encontrado un error' });
                var productsArray = cartFound.productsBt;
                if(productsArray.length == 0) return res.status(500).send({ mensaje: 'No tiene productos en su carrito, puede ver el catálogo de productos' });
                billBuilder.userIdBill = cartFound.userId;
                billBuilder.totalBill = cartFound.total;
                billBuilder.productsBtBill = cartFound.productsBt.slice();

                //Guardamos en una variable el array de la lista de productos del carrito. Como utilizamos el metodo splice(0) esta ya está vacía;
                // var cartEmpty = cartFound.productsBt;  not use

                //Guardamos los datos del carrito en la factura
                billBuilder.save((er, billSaved)=>{
                    if(er) return res.status(500).send({ mensaje: 'Hemos encontrado un error' });
                    if(!billSaved) return res.status(500).send({ mensaje: 'No se ha podido agregar la factura' });

                    //Función para cambiar actualizar el stock
                    productsArray.forEach(function(product){
                        productModel.findById(product.idProduct, (er, productUpdating)=>{
                            productModel.findByIdAndUpdate(product.idProduct, 
                            {stock: (productUpdating.stock - product.amount), sold: (productUpdating.sold + product.amount)},
                            {new: true, useFindAndModify: false},(er, productUpdated)=>{})
                        })
                    })

                    //Función para vaciar el carrito del usuario. Le enviamos la variable cartEmpty
                    cartModel.findOneAndUpdate({ userId: req.user.sub }, {$set:{productsBt: []}, total:0},(er, cartEmpty)=>{})

                    return res.status(200).send({ 'Factura Guardada':  billSaved });
                });
            });
    },

    //Función para visualizar las facturas de un usuario
    readBillUser: function(req,res){
        var params = req.body;
        var idUser = params.idUser

        //Verificación del rol administrador
        if(req.user.rol != 'Administrador') return res.status(500).send({ mensaje: 'Sólo los administradores pueden ver las facturas' });

        //Buscamos las facturas del usuario
        billModel.find({ userIdBill: idUser},(er,billFound)=>{
            if(er) return res.status(500).send({ mensaje: 'Ha pasado algo malo, un error debe estar por aquí' });
            if(!billFound) return res.status(500).send({ mensaje: 'Este usuario no tiene facturas' });
            return res.status(200).send(billFound);
        });
    },

    //Función para visualizar los productos de una factura.
    readProductsBill: function(req,res){
        var params = req.body;
        var idBill = params.idBill;

        billModel.findOne({ _id: idBill }, { userIdBill: 0, totalBill: 0 }, (er, billFound)=>{
            if(er) return res.status(500).send({ mensaje: '¡Error! verifícalo' });
            if(!billFound) return res.status(500).send({ mensaje: 'No existe ninguna factura con ese ID' });

            return res.status(200).send({ 'Productos de la Factura':  billFound });
        }).populate( "productsBtBill.idProduct", "name");
    },

    //Función para visualizar los productos agotados
    readProductsExhausted: function(req,res){

        //Buscar los productos que tienen su stock en 0
        productModel.find({ stock: 0 },(er, productFound)=>{
            if(er) return res.status(500).send({ mensaje: 'Error en la petición' });
            if(!productFound) return res.status(500).send({ mensaje: 'No hay productos agotados' });

            return res.status(200).send({ 'Productos agotados': productFound });
        });
    },
    
    //Función para visualizar los productos más vendidos
    readProductsSoldOut: function(req,res){

        //Buscamos los productos 
        productModel.find((er,productsFound)=>{
            if(er) return res.status(500).send({ mensaje: 'Error en la petición' });
            if(!productsFound) return res.status(500).send({ mensaje: 'No hemos encontrado los productos' })

            return res.status(200).send({ productsFound });
        }).sort({sold:-1}).limit(5);
    },

    //Función para visualizar la factura de su compra de forma detallada
    itemizedBill: function(req,res){
        
        //Función para buscar las facturas de usuario logueado
        billModel.find({ userIdBill: req.user.sub }, (er, billFound)=>{
            if(er) return res.status(500).send({ mensaje: 'Hemos encontrado un error' });
            if(!billFound) res.status(500).send({ mensaje: 'Este usuario no ha realizado ninguna compra. Te invitamos a comprar' });

            return res.status(200).send({billFound});
        }).populate( "productsBtBill.idProduct", "name");
    },

    //Función para crear el pdf
    createBillPDF: function(req, res){
        var idBill = req.params.idUser;

        //Evaluar si es rol administrador
        if(req.user.rol != 'Administrador') return res.status(500).send({ mensaje: 'Solo los administradores pueden realizar esta acción' });

        //Buscamos la factura que le estamos enviando
        billModel.find({ _id: idBill },(er, bills)=>{
            if(er) return res.status(500).send({ mensaje: 'Hemos encontrado un error, revísalo amigo' });
            if(bills.length == 0) return res.status(500).send({ mensaje: 'No hay ninguna factura con ese id, revísalo' });
            
            //Creamos la variables del lugar donde se encuentran los productos en la factura
            var products = bills[0].productsBtBill;
            //Creamos otra variable para almacenar los productos para luego recorrerlos y mostrarlos
            var productsBill = [];

            products.forEach(Element =>{
                productsBill.push(Element);
            });

            //Buscamos el usuario dueño de la factura
            userModel.findById(bills[0].userIdBill, (er, user)=>{
                if(er) return res.status(500).send({ mensaje: 'Error en la petición' });
                if(!user) return res.status(500).send({ mensaje: 'No hemos encontrado ningún usuario con ese id' });

            //Recorremos el Array de los productos
            for(var step= 0; step<productsBill.length ;step++){
                    var pdfBills = `
                            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl" crossorigin="anonymous">
                            <link rel="preconnect" href="https://fonts.gstatic.com">
                            <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@1,100&display=swap" rel="stylesheet">
                            <body>
                                <div class="position-relative container" style="font-family: 'Roboto', sans-serif; margin= 30px;">
                                    <h1 class="text-center" style="margin-top: 50px; margin-bottom: 30px" ><strong><u>Factura Compras online</u></strong></h1>
                                    <div style="margin-left: 50px; background-color: #E5E4E6; width: 90%;">
                                        <p><b>Usuario:</b> ${user.user}</p>
                                        <p><b>ID del usuario:</b> ${user._id}</p>
                                        <p><b>Id Factura:</b> ${productsBill[step]._id}</p>
                                    </div>
                                    <table class="table" style="margin-left:50px;  width: 90%">
                                        <thead>
                                            <tr class="">
                                                <th scope="col"><strong>Producto</strong></th>
                                                <th scope="col"><strong>Precio</strong></th>
                                                <th scope="col"><strong>Cantidad</strong></th>
                                                <th scope="col"><strong>Subtotal</strong></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${productsBill.map(objects => `
                                                <tr>
                                                    <td>${objects.idProduct}</td>
                                                    <td>${objects.price}</td>
                                                    <td>${objects.amount}</td>
                                                    <td  style="text-align: right;">${objects.subTotal}</td>
                                                </tr> `).join('').replace(/['"{}']+/g,'')} 
                                                <td COLSPAN="4" style="text-align: right;"><strong>Total:</strong> ${bills[0].totalBill}</td>
                                        </tbody>
                                    </table>
                                </div>
                            </body>`;
                            
                            PDF.create(pdfBills).toFile('./src/node-pdf/BillsPDF.pdf', function(er,res){
                                if(er){
                                    console.log(er);
                                }else{
                                    console.log(res);
                                }
                            });
                            return res.status(200).send({ mensaje: `Se ha creado su factura en la ruta 'src/node-pdf/BillsPDF.pdf' del proyecto` });
                        }
            });
        }).populate( "productsBtBill.idProduct.$*.name");
    }
}