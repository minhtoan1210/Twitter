import { Router } from 'express'
import { verifyEmailController, loginController, logoutController, registerController, resendlVerifyEmailController, forgotPasswordController, verifyForgotPasswordController, resetPasswordController, getMeController } from '~/controllers/users.controllers'
import { accessTokenValidator, emailVerifyTokenValidator, forgotPasswordValidator, loginValidator, refreshTokenValidator, registerValidator, resetPasswordValidator, verifyForgotPasswordTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
const usersRouter = Router()

usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendlVerifyEmailController))
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))
usersRouter.post('/verify-forgot-password', verifyForgotPasswordTokenValidator, wrapRequestHandler(verifyForgotPasswordController))
usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))
usersRouter.post('/me', accessTokenValidator, wrapRequestHandler(getMeController))
export default usersRouter  