import { Types } from "mongoose"
import { jwtHelper } from "./jwtHelper"
import config from "../config"
import bcrypt from "bcrypt"
const createToken = (authId: Types.ObjectId, role: string) => {
    const accessToken = jwtHelper.createToken(
      { authId, role },
      config.jwt.jwt_secret!,
      config.jwt.jwt_expire_in as string,
    )
   
    return { accessToken }
  }
   
  const isPasswordMatched = async (
    plainTextPassword: string,
    hashedPassword: string,
  ) => {
    return await bcrypt.compare(plainTextPassword, hashedPassword)
  }
   
  export const AuthHelper = { createToken, isPasswordMatched }