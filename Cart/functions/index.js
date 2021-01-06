const functions =require('firebase-functions')
const admin =require('firebase-admin')
const fs= require('fs');

const FieldValue= admin.firestore.FieldValue;

var serviceAccount =require("./permission_product.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

const express = require('express')
const app= express()
const db= admin.firestore()

const cors= require('cors');
const { error } = require('firebase-functions/lib/logger');
app.use(cors ({origin:true}))


app.delete('/cart/remove/:item',(req,res)=>{
    (async ()=>{
        try{


          
          
            await deletItem(req.headers["session-id"],req.params.item)
            return res.status(200).send()

        }
        catch(error){
            console.log(error)
            return res.status(500).send()

        }
    })()
    
})


app.delete('/cart/decrease/:item',(req,res)=>{
    (async ()=>{
        try{


            let itemCount= await checkItem(req.headers["session-id"],req.params.item)
            console.log(itemCount)
            await updateItem(req.params.item,itemCount-1,req.headers["session-id"])
            if(itemCount<1)
            await deletItem(req.headers["session-id"],req.params.item)
            return res.status(200).send()

        }
        catch(error){
            console.log(error)
            return res.status(500).send()

        }
    })()
    
})


app.get('/cart',( req, res)=>{
    (async ()=>{
        try{

            
            let data=""
            await db.collection("cart").doc(req.headers["session-id"]).get().then(doc=>{

                data=doc.data()
                return
            })
            return res.status(200).send(data)

        }
        catch(error){

            return res.status(500).send()

        }
    })()
})

app.post('/cart/add/:name', (req,res)=>{
    (async ()=>{
    try{
        
    let session_id=checkHeader(req.headers)
    console.log(session_id)
    if(session_id){
       //let a =  await checkSession(session_id)
       //console.log(a)
       if(!fs.existsSync("./sessions/"+session_id+".txt")){
          
            
            return res.status(400).send();

           }

         
       // console.log(a," a ")
        let itemCount =await checkItem(session_id,req.params.name)
        console.log(itemCount," itemCount")
        
            //await addItemInExistingSession(req.params.name,session_id)
            await updateItem(req.params.name,itemCount+1,session_id)
        
       

    }
    else{
       
        let session_code=await addItem(req.params.name)
        console.log(session_code," session code")
        return res.writeHead(200, {'session-id': session_code}).send();

    }
    //checkSession()

    return res.status(200).send()
    
    }
    catch(err){
        console.log(err)

    }
})()
})

const createSession = (name)=>{

    try{
    fs.appendFile("./sessions/"+name+".txt","", function(err){
        if (err) 
        throw err;
    } )
}
catch(err){

}

}



const checkHeader=(header)=>{
  
    if(header["session-id"]!=undefined){
        return header["session-id"]
    }
    else{
        return 0
    }


}


/*
    check item
*/
const checkItem=(async( sessionId,itemName)=>{
   
    
        let count=0
        console.log("check ",sessionId,itemName)
        const document=db.collection("cart").doc(sessionId);
        await document.get().then(doc =>{
            if(doc.exists){
                let item=doc.data()
                console.log(" ashche",item[itemName])
                if(item[itemName]!=undefined){
                  
                    count=item[itemName];
                   
                }
            }
        })
        return count

    })

    const addItem =(async (itemName)=>{
       
        return await db.collection("cart").add(
            {
                [itemName]:1
            }
        ).then(function(docRef){
            console.log(docRef.id," docref")
           
            return docRef.id
        

        }).catch( function(err){
            console.log(err)
        })

    })

   

    const updateItem= (async (itemName,itemCount,sessionId) =>{
        console.log(sessionId," ss sessionId ")
        try
        {            
            const document=db.collection('cart').doc('/'+sessionId+'/');
           
            await document.update
            ({
        
                [itemName]:itemCount,    
               
         });
           

        }
        catch (error)
        {
            console.log("Hello")
            console.log(error);
           
        }


    })

    const deletItem= (sessionId,itemName)=>{
        (async ()=>{

            try{
                await db.collection("cart").doc(sessionId).update({
                    [itemName]:FieldValue.delete()
                })
            }
            catch(error){
                console.log(error)
            }
            

        })()
    }


  
    


exports.app = functions.https.onRequest(app)