import databaseService from './database.services'
import { RegisterReqBoby } from '~/models/request/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/message'

class UsersService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      privateKey: process.env.JWR_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    }
    )
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      privateKey: process.env.JWR_SECRET_REFRESH_TOEKN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }

    }
    )
  }

  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyTOken
      },
      privateKey: process.env.JWR_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }

  private signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken
      },
      privateKey: process.env.JWR_SECRET_FORGOT_PASSWORL_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORL_TOKEN_EXPIRES_IN
      }
    })
  }

  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
  }

  async register(payload: RegisterReqBoby) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id.toString())
    await databaseService.refreshTokens.insertOne(new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token }))
    return {
      access_token,
      refresh_token
    }
  }

  async checkEmailExit(email: string) {
    const result = await databaseService.users.findOne({ email })
    return Boolean(result)
  }

  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
    await databaseService.refreshTokens.insertOne(new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token }))
    return {
      access_token,
      refresh_token
    }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }

  async verifyEmail(user_id: string) {
    //c1 dung bth
    // const result = await databaseService.users.updateOne(
    //   { _id: new ObjectId(user_id) },
    //   {
    //     $set: {
    //       email_verify_token: '',
    //       updated_at: new Date
    //     }
    //   }
    // )

    // const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)

    //c2 dung promise.all
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken(user_id),
      databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        [{
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified,
            updated_at: "$$NOW"
          },
          // c1 de cap nhat thoi gian khi mongoDB ghi vao data
          // $currentDate: {
          //   updated_at: true
          // }
        }]
      )
    ])

    const [access_token, refresh_token] = token

    return {
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken(user_id)

    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token,
        },
        $currentDate: {
          updated_at: true
        }
      })
    return {
      message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS
    }
  }

  async forgotPassword(user_id: string) {
    const forgot_password_token = await this.signForgotPasswordToken(user_id)
    console.log("forgot_password_token", forgot_password_token)
    databaseService.users.updateOne({
      _id: new ObjectId(user_id)
    }, [{
      $set: {
        forgot_password_token,
        updated_at: "$NOW"
      }
    }])
    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }
  async resetPassword(user_id: string, password: string) {
    databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token: "",
          password: hashPassword(password)
        },
        $currentDate: {
          updated_at: true
        }
      })
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }

  async getMe(user_id: string) {
    const user = databaseService.users.findOne({ _id: new ObjectId(user_id) }, {
      projection: {
        password: 0,
        email_veryfy_token: 0,
        forgot_password_token: 0
      }
    })
    return user
  }
}

const usersService = new UsersService()
export default usersService
