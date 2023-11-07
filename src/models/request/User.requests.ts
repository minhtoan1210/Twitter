import { JwtPayload } from "jsonwebtoken"
import { TokenType } from "~/constants/enums"
import { ParamsDictionary } from 'express-serve-static-core'

export interface LoginReqBody {
  email: string
  password: string
}

export interface VerifyEmailReqBody {
  email_verify_token: string
}

export interface ResetPassWordReqBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}

export interface GetProfileReqParams {
  username: string
}

export interface FollowReqBody {
  followed_user_id: string
}


export interface UnfollowReqBody extends ParamsDictionary {
  user_id: string
}
export interface ForgotPasswordReqBody {
  email: string
}

export interface VerifyForgotPassswordReqBody {
  forgot_password_token: string
}
export interface RegisterReqBoby {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface LogoutReqBody {
  refresh_token: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}

export interface UpdateMeReqBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}