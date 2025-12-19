import { RequestHandler, Router }from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import {
    addProduct,
    getAllProduct
} from '../controller/productController'

const makeRouter = (
    dbClient: PrismaClient,
    authenticateUser: RequestHandler,
    uploadLogo: any
): Router => {
    const router = Router()

    // Add Product
    router.post('/', authenticateUser, addProduct)

    // Get All Products
    router.get('/', authenticateUser, getAllProduct)

    return router
}

export default makeRouter