import { Collection, Db, MongoClient } from 'mongodb'
import { config } from 'dotenv'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import User from '~/models/schemas/User.schema'
import Follower from '~/models/schemas/Followers.schema'

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
    } catch(error) {
     console.log("Error", error)
     throw error
    }
  }

  get users():Collection<User> {
    return this.db.collection('users')
  }

  get refreshTokens():Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }

  get followers():Collection<Follower> {
    return this.db.collection('followers')
  }
}

const databaseService = new DatabaseService()
export default databaseService
