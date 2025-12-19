import { RequestHandler, Router }from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import {
    addPurchase,
    getAllPurchase
} from '../controller/purchaseController'

const makeRouter = (
    dbClient: PrismaClient,
    authenticateUser: RequestHandler,
    uploadLogo: any
): Router => {
    const router = Router()

    // Add Product
    router.post('/', authenticateUser, addPurchase)

    // Get All Products
    router.get('/', authenticateUser, getAllPurchase)

    return router
}

export default makeRouter