const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
// const JWT_SECRET ='Vivek$oy'


const fetchUser=(req,res,next)=>{
    //Get the user  from jwt token and add id to req body
   
    const token = req.headers["x-authorization"];
   
    if(!token){
        // res.status(401).send({error:"Please Authenticate using valid token"})
        return res.json({
            statuscode:404,
            status:"error",
            message:"Token not found"
        })
    }
    try{
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.auth = data.user;
        next();

    }catch(error){
        return res.json({
            statuscode:403,
            status:"error",
            message:error.message 
        })
    }
  
}


module.exports=fetchUser;