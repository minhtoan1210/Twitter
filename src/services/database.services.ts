import { Collection, Db, MongoClient } from 'mongodb'
import { config } from 'dotenv'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import User from '~/models/schemas/User.schema'
import Follower from '~/models/schemas/Followers.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Bookmark from '~/models/schemas/Bookmark.schema'
import Like from '~/models/schemas/Like.schema'

config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.nk3ogmh.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(`${process.env.DB_NAME}`)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log("Error", error)
      throw error
    }
  }

 async indexUsers() {
    const exists = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1'])

    if (!exists) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }

  async indexRefreshTokens() {
    const exists = await this.refreshTokens.indexExists(['exp_1', 'token_1'])
    if (!exists) {
      this.refreshTokens.createIndex({ token: 1 })
      this.refreshTokens.createIndex(
        { exp: 1 },
        {
          expireAfterSeconds: 0
        }
      )
    }
  }

  // async indexVideoStatus() {
  //   const exists = await this.videoStatus.indexExists(['name_1'])
  // }

  // async indexFollowers() {
  //   const exists = await this.followers.indexExists(['user_id_1_followed_user_id_1'])
  //   if (!exists) {
  //     this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
  //   }
  // }

  get users(): Collection<User> {
    return this.db.collection('users')
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection('Tweet')
  }

  get followers(): Collection<Follower> {
    return this.db.collection('followers')
  }

  // get videoStatus(): Collection<VideoStatus> {
  //   return this.db.collection('videoStatus')
  // }

    get hashtags(): Collection<Hashtag> {
    return this.db.collection('Hashtags')
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection("Bookmarks")
  }

  get likes(): Collection<Like> {
    return this.db.collection("Likes")
  }
}

const databaseService = new DatabaseService()
export default databaseService
