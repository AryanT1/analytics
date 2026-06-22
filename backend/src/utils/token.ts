import jwt from "jsonwebtoken"
export const generateToken = (userId: String)=>{
    try{
        const secret = process.env.JWT_SECRET 
        if(!secret){
            throw new Error("jwt secret is not defined")
        }

        return jwt.sign({userId}, secret , {expiresIn: "7d"})
    }
    catch(err:any)
    {
        console.error(err)
        throw new Error("Token generation failed")
    }
}