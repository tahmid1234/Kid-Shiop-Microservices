

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


//routes
app.get('/hello-world', (req,res)=>{
    return res.status(200).send('hello');
});

//create

app.post('/rate', (req,res)=>{
    (async ()=> {
        try{
            rating= await get_rating(req)
            
            //adding new rating section
            if(rating.rating<1){
            await db.collection('rating').doc('/'+req.body.productId+'/').collection('rated_product').doc('/'+req.body.raterId+'/')
            .create({
                productId:req.body.productId,
                rating:req.body.rating,
                raterId:req.body.raterId,
               
            })
        }
        else{
          
            //updating existing rating
            update_rating(req);
        }

        //updating product section

        rating_details=await get_rating_details(req)
        console.log(rating_details," Rating")
        if(rating_details.raters>4)
        {
            let averageRating=rating_details.totalRating/rating_details.raters
            axios.put('http://localhost:8080/microserviceproduc/us-central1/app/product/update/ratingDetails/'+req.body.productId,{
                    averageRating:averageRating,
                    raters:rating_details.raters
            })
            .then(result=>
                {
                console.log(result);
            })
            .catch(error=>
                {
                console.log(error);
            });
        }


            return res.status(200).send();

        }
        catch (error)
        {
            console.log(error);
            return res.status(500).send();
        }

    })();
});

//read
//to check how many ratings a user has given to a product
const get_rating= (async (req,rating)=> 
{
        try
        { 

            const document=db.collection('rating').doc('/'+req.body.productId+'/').collection('rated_product').doc('/'+req.body.raterId+'/');
            let product =await document.get().then(doc=>
                {
                if(!doc.exists)
                {
                   
                    rating={rating:0}
                }
                else
                {
                console.log(doc.data().rating)
                rating={rating:doc.data().rating}
              
                }
                
            }).catch(error=>
                {
                console.log("error"+error)
                return rating={rating:-1};
            })
             return rating;

        }
        catch (error){
            console.log("Hello")
            console.log(error);
            return  rating={rating:-1};;
        }

    });


    // update existing rating value
    const update_rating= (async (req,res)=> 
    {
        try
        {            
            const document=db.collection('rating').doc('/'+req.body.productId+'/').collection('rated_product').doc('/'+req.body.raterId+'/');
            await document.update
            ({
        
                rating:req.body.rating,    
               
         });
           

        }
        catch (error)
        {
            console.log("Hello")
            console.log(error);
           
        }

    });



const get_rating_details=  (async (req)=> 
{
        try
        {
            let query=db.collection('rating').doc('/'+req.body.productId+'/').collection('rated_product');
            let rater_map={};
            let rater=0;
            let total_rating=0;
            await query.get().then(querySnapshot =>{
                let docs=querySnapshot.docs;
                
                for(let doc of docs)
                {
                    if(!( doc.id in rater_map))
                    {
                        rater=rater+1;
                        rater_map[doc.id]=1
                    }
                    total_rating=total_rating+doc.data().rating;   
                }
                
                res=
                {
                    raters:rater,
                    totalRating:total_rating
                }
                return res;
            })
            
            return res;

        }
        catch (error){
            console.log("Hello")
            console.log(error);           
        }

    });



//export the api to firebase cloud functuin


exports.app =functions.https.onRequest(app);

