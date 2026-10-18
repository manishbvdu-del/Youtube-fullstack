
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import mongoose,{Schema} from "mongoose";

const userSchema = new Schema(
    {
     username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
     },
      email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
     },
      fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
     },
     avatar:{
        type:String,
        required:true
     },
      coverImage:{
        type:String,
     },
     watchHistory:[
       {
        type:Schema.Types.ObjectId,
        ref:"Video"
       }
     ],
     password:{
        type:String,
        required:[true,'Password is required']
     },
     refreshToken:{
        type:String
     }
     
},
{
    timestamps:true
}

);

// Hash password before saving
userSchema.pre("save", async function () {

    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password,10)
    
})

// Compare password
userSchema.methods.isPasswordCorrect = async function (password){
   return await bcrypt.compare(password,this.password)
}

// Generate Access Token
userSchema.methods.generateAccessToken = function(){
    console.log("Access token generation started");
   console.log("Access secret exists:", !!process.env.ACCESS_TOKEN_SECRET);
   console.log("Access expiry:", process.env.ACCESS_TOKEN_EXPIRY);

   return jwt.sign(
    {
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function(){
      console.log("Refresh token generation started");
   console.log("Refresh secret exists:", !!process.env.REFRESH_TOKEN_SECRET);
   console.log("Refresh expiry:", process.env.REFRESH_TOKEN_EXPIRY);

      return jwt.sign(
    {
        _id:this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}

// Export User Model
export const User = mongoose.model("User",userSchema)
