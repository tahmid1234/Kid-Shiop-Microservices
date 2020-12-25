

const functions = require('firebase-functions');
const admin = require('firebase-admin');

const axios =require('axios');


var serviceAccount = require("./permission.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const express = require('express');
const app = express();
const db=admin.firestore();

const cors= require('cors');
app.use( cors({origin:true}))

const loadPosts = async () => {
    
    const response = await getPostss();
    if (response.ok) {
      console.log("Yes hoise")
    }
  };
//routes
app.get('/hello-world', (req,res)=>{
    return res.status(200).send('hello');
});

//create

app.post('/hello-world', (req,res)=>{
    (async ()=> {
        try{
            await db.collection('products').doc('/'+req.body.id+'/')
            .create({
                name:req.body.name,
                desc:req.body.description
            })
            axios.get('https://jsonplaceholder.typicode.com/posts')
            .then(result=>{
                console.log(result)
            })
            .catch(error=>{
                console.log(error)
            })

            return res.status(200).send();

        }
        catch (error){
            console.log(error);
            return res.status(500).send();
        }

    })();
});

//read
app.get('/hello-world/read/:id', (req,res)=>{
    (async ()=> {
        try{
            const document=db.collection('products').doc(req.params.id);
            let product =await document.get();
            let reponse=product.data();


            return res.status(200).send(reponse);

        }
        catch (error){
            console.log("Hello")
            console.log(error);
            return res.status(500).send(error);
        }

    })();
});

app.get('/hello-world/read', (req,res)=>{
    (async ()=> {
        try{
            let query=db.collection('products');
        
            let respons=[];
            await query.get().then(querySnapshot =>{
                let docs=querySnapshot.docs;
                for(let doc of docs){
                    const selectedItem={
                        id:doc.id,
                        name:doc.data().name,
                        desc:doc.data().desc
                    }
                    respons.push(selectedItem)

                }
                return respons;
            })

            
            return res.status(200).send(respons);

        }
        catch (error){
            console.log("Hello")
            console.log(error);
            return res.status(500).send(error);
        }

    })();
});

//update

//delete

//export the api to firebase cloud functuin

exports.app =functions.https.onRequest(app);

