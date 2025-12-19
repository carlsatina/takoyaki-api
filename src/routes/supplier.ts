import { RequestHandler, Router }from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import {
    addSupplier,
    getAllSupplier,
    getSupplierById,
    editSupplier
} from '../controller/supplierController'

const makeRouter = (
    dbClient: PrismaClient,
    authenticateUser: RequestHandler,
    uploadLogo: any
): Router => {
    const router = Router()

    // Add Product
    router.post('/', authenticateUser, addSupplier)

    // Get All Products
    router.get('/', authenticateUser, getAllSupplier)

    // Get Supplier by Id
    router.get('/:id', getSupplierById)

    // Get Supplier by Id
    router.put('/:id', editSupplier)

    return router
}

export default makeRouter