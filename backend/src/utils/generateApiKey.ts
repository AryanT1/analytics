 import crypto from "crypto"
 export const generateApiKey = ()=>{
return "ak_" + crypto.randomBytes(32).toString("hex")

}

