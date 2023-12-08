import { NextFunction, Request, Response } from "express";
import { checkSchema } from "express-validator";
import { isEmpty, values } from "lodash";
import { ObjectId } from "mongodb";
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from "~/constants/enums";
import HTTP_STATUS from "~/constants/httpStatus";
import { TWEETS_MESSAGES, USERS_MESSAGES } from "~/constants/message";
import { ErrorWithStatus } from "~/models/Errors";
import Tweet from "~/models/schemas/Tweet.schema";
import databaseService from "~/services/database.services";
import { numberEnumToArray } from "~/utils/commons";
import { wrapRequestHandler } from "~/utils/handlers";
import { validate } from "~/utils/validation";

const tweetTypes = numberEnumToArray(TweetType)
const tweetAudiences = numberEnumToArray(TweetAudience)
const mediaTypes = numberEnumToArray(MediaType)
export const createTweetValidator = validate(checkSchema({
  type: {
    isIn: {
      options: [tweetTypes],
      errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE
    }
  },
  audience: {
    isIn: {
      options: [tweetAudiences],
      errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE
    }
  },
  parent_id: {
    custom: {
      options: (values, { req }) => {
        const type = req.body.type as TweetType
        if ([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) && !ObjectId.isValid(values)) {
          throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
        }
        if (type === TweetType.Tweet && values !== null) {
          throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
        }
        return true
      }
    }
  },
  content: {
    custom: {
      options: (values, { req }) => {
        const type = req.body.type as TweetType
        const hashtags = req.body.hashtag as string[]
        const mentions = req.body.mentions as string[]
        if ([TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) && isEmpty(hashtags) && isEmpty(mentions) && values === '') {
          throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
        }
        if (type === TweetType.Retweet && values !== '') {
          throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
        }
        return true
      }
    }
  },
  hashtags: {
    isArray: true,
    custom: {
      options: (values, { req }) => {
        if (!values.every((item: any) => typeof item === 'string')) {
          throw new Error(TWEETS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING)
        }
        return true
      }
    }
  },
  mentions: {
    isArray: true,
    custom: {
      options: (values, { req }) => {
        if (!values.every((item: any) => ObjectId.isValid(item))) {
          throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
        }
        return true
      }
    }
  },
  medias: {
    isArray: true,
    custom: {
      options: (value, { req }) => {
        if (value.some((item: any) => {
          return typeof item.url !== 'string' || !mediaTypes.includes(item.type)
        })) {
          throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
        }
        return true
      }
    }
  }
}))

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: TWEETS_MESSAGES.INVALID_TWEET_ID
              })
            }
            const tweet = await databaseService.tweets.findOne({ _id: new ObjectId(value) })
            if (!tweet) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: TWEETS_MESSAGES.TWEET_NOT_FOUND
              })
            }
            ; (req as Request).tweet = tweet
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

export const isUserLoggedInValidator = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      console.log("asdsa", req)
      return middleware(req, res, next)
    }
    next()
  }
}

// Muốn sử dụng async await trong handler express thì phải có try catch
// Nếu không dùng try catch thì phải dùng wrapRequestHandler
export const audienceValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet
  console.log("tweet", tweet)
  if (tweet.audience === TweetAudience.TwitterCircle) {
    // Kiểm tra người xem tweet này đã đăng nhập hay chưa
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.UNAUTHORIZED,
        message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
      })
    }
    const author = await databaseService.users.findOne({
      _id: new ObjectId(tweet.user_id)
    })
    // Kiểm tra tài khoản tác giả có ổn (bị khóa hay bị xóa chưa) không
    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    }
    // Kiểm tra người xem tweet này có trong Twitter Circle của tác giả hay không
    const { user_id } = req.decoded_authorization
    // chuưa lamàm dđc 
    const isInTwitterCircle = author.twitter_circle.some((user_circle_id) => user_circle_id.equals(user_id))
    // Nếu bạn không phải là tác giả và không nằm trong twitter circle thì quăng lỗi
    if (!author._id.equals(user_id) && !isInTwitterCircle) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: TWEETS_MESSAGES.TWEET_IS_NOT_PUBLIC
      })
    }
  }
  next()
})
