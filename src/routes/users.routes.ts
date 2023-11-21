import { Router } from 'express'
import { verifyEmailController, loginController, logoutController, registerController, resendlVerifyEmailController, forgotPasswordController, verifyForgotPasswordController, resetPasswordController, getMeController, updateMeController, getProfileController, followController, unfollowController, changPasswordController, oauthController, refreshTokenController } from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { accessTokenValidator, changPasswordValidator, emailVerifyTokenValidator, followValidator, forgotPasswordValidator, loginValidator, refreshTokenValidator, registerValidator, resetPasswordValidator, unfollowValidator, updateMeValidator, verifiedUserValidator, verifyForgotPasswordTokenValidator } from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/request/User.requests'
import { wrapRequestHandler } from '~/utils/handlers'
const usersRouter = Router()

/**
 * Description. Register a new user
 * Path: /register
 * Method: POST
 * Body: { name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601 }
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))


usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

usersRouter.get('/oauth/google', wrapRequestHandler(oauthController))
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
usersRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendlVerifyEmailController))
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))
usersRouter.post('/verify-forgot-password', verifyForgotPasswordTokenValidator, wrapRequestHandler(verifyForgotPasswordController))
usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))
usersRouter.patch('/me', accessTokenValidator, verifiedUserValidator, updateMeValidator, filterMiddleware<UpdateMeReqBody>([
  'name',
  'date_of_birth',
  'bio',
  'location',
  'website',
  'username',
  'avatar',
  'cover_photo'
]), wrapRequestHandler(updateMeController))
usersRouter.get('/:username', wrapRequestHandler(getProfileController))
usersRouter.get('/follow', accessTokenValidator, verifiedUserValidator, followValidator, wrapRequestHandler(followController))
usersRouter.delete('/follow/:user_id', accessTokenValidator, verifiedUserValidator, unfollowValidator, wrapRequestHandler(unfollowController))
usersRouter.put('/chang-password', accessTokenValidator, verifiedUserValidator, changPasswordValidator, wrapRequestHandler(changPasswordController))
export default usersRouter  