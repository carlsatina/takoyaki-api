import { RequestHandler, Router }from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import { 
    getInventoryByType,
    getInventoryUsage,
    updateInventoryStock
} from '../controller/inventoryController'

const makeRouter = (
    dbClient: PrismaClient,
    authenticateUser: RequestHandler,
    uploadLogo: any
): Router => {
    const router = Router()

    // Get Inventory by Type
    router.get('/', authenticateUser, getInventoryByType)
    router.get('/usage', authenticateUser, getInventoryUsage)
    router.patch('/:id/stock', authenticateUser, updateInventoryStock)

    return router
}

export default makeRouter
