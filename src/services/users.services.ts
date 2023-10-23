import databaseService from './database.services'
import { RegisterReqBoby } from '~/models/request/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'
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
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    }
    )
  }

  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
  }

  async register(payload: RegisterReqBoby) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )

    const user_id = result.insertedId.toString()
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
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
    await databaseService.refreshTokens.deleteOne({token: refresh_token})
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }
}

const usersService = new UsersService()
export default usersService
