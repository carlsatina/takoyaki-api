import { RequestHandler, Router }from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import {
    addSales,
    getSales,
    getAllSales,
    getLatestSalesId
} from '../controller/salesController'

const makeRouter = (
    dbClient: PrismaClient,
    authenticateUser: RequestHandler
): Router => {
    const router = Router()

    // Add Product
    router.post('/', authenticateUser, addSales)

    // Get Sales (with optional limit and includeItems query params)
    router.get('/getSales', authenticateUser, getSales)

    // Get All Products
    router.get('/', authenticateUser, getAllSales)

    // Get Latest Sales Id
    router.get('/getLatestSalesId', authenticateUser, getLatestSalesId)

    return router
}

export default makeRouter