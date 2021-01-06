const functions =require('firebase-functions')
const admin =require('firebase-admin')
const fs= require('fs');

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

const checkSession = (async (fileName)=> {
    console.log(fileName," filename")
     let a=200
     fs.readFile("./sessions/"+fileName+".txt",'utf8', function(err,data){
       
        if (err){
            a=400;
            console.log
            console.log(fileName," error")
           
            
            }
            else{
                a=200
                console.log(fileName," not error",a)
            }
            
       
        console.log(data)
    } )
    return a
})

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
        await db.collection("cart").add(
            {
                [itemName]:1
            }
        ).then(function(docRef){
            
            createSession(docRef.id)
            return docRef.id
        

        }).catch( function(err){
            console.log(err)
        })

    })

    const addItemInExistingSession =(async (itemName,sessionId)=>{
        await db.collection("cart").doc(sessionId).create(
            {
                [itemName]:1
            }
        )

    })

    const updateItem= (async (itemName,itemCount,sessionId) =>{
        console.log(sessionId," ss sessionId ")
        try
        {            
            const document=db.collection('cart').doc('/'+sessionId+'/');
            await document.get().then(doc=>{
                if(doc.exists){
                    console.log("doc",doc.data())
                }
            })
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


  
    


exports.app = functions.https.onRequest(app);