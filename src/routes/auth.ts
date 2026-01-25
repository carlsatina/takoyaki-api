import { RequestHandler, Router }from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { ExtendedRequest } from '../../extendedRequest'
import {
    googleLogin,
    fbLogin,
    login,
    register,
    getProfile,
    listAccounts,
    editAccount
} from '../controller/authController'

dotenv.config()

const makeRouter = (
    dbClient: PrismaClient,
    authenticateUser: RequestHandler
): Router => {
    const router = Router()

    // Google Login
    router.post('/googleLogin', googleLogin)
    
    // FB Login
    router.post('/fbLogin', fbLogin)

    // Login
    router.post('/login', login)

    // Register
    router.post('/register', register)

    // Get Profile
    router.get('/profile', authenticateUser, getProfile)

    // List ACcounts
    router.get('/accounts', authenticateUser, listAccounts)

    // Edit Account
    router.put('/edit-account', authenticateUser, editAccount)
  
    return router
}

export default makeRouter
