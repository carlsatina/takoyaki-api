import { RequestHandler, Router }from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import {
    addPackaging,
    getAllPackaging,
    getPackagingByid,
    editPackaging
} from '../controller/packagingController'

const makeRouter = (
    dbClient: PrismaClient,
    authenticateUser: RequestHandler,
    uploadLogo: any
): Router => {
    const router = Router()

    // Add Packaging
    router.post('/', authenticateUser, addPackaging)

    // Get All Packaging
    router.get('/', authenticateUser, getAllPackaging)

    // Get Packaging by Id
    router.get('/:id', getPackagingByid)

    // Edit Packaging
    router.put('/:id', editPackaging)

    return router
}

export default makeRouter