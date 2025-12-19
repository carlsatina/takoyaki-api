import { RequestHandler, Router }from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import {
    addExpense,
    getAllExpense,
    getExpenseByid,
    editExpense
} from '../controller/expenseController'

const makeRouter = (
    dbClient: PrismaClient,
    authenticateUser: RequestHandler,
    uploadLogo: any
): Router => {
    const router = Router()

    // Add Packaging
    router.post('/', authenticateUser, addExpense)

    // Get All Packaging
    router.get('/', authenticateUser, getAllExpense)

    // Get Packaging by Id
    router.get('/:id', getExpenseByid)

    // Edit Packaging
    router.put('/:id', editExpense)

    return router
}

export default makeRouter