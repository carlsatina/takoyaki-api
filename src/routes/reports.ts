import { RequestHandler, Router }from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import {
    getSalesReport,
    getNumberOfReceipts,
    getSalesByPaymentMode,
    getSalesByHour,
    getTopSellingItemByDateRange
} from '../controller/reportsController'

const makeRouter = (
    dbClient: PrismaClient,
    authenticateUser: RequestHandler
): Router => {
    const router = Router()

    // Get Sales Reports
    router.get('/', authenticateUser, getSalesReport)

    // Get number of sales receipts
    router.get('/receipts', authenticateUser, getNumberOfReceipts)

    // Get Sales by payment mode
    router.get('/payment_mode', authenticateUser, getSalesByPaymentMode)

    // Get Sales by Hour
    router.get('/hour', authenticateUser, getSalesByHour)

    // Get Top Selling Item by Date Range
    router.get('/top-selling-item', authenticateUser, getTopSellingItemByDateRange)

    return router
}

export default makeRouter