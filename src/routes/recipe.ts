import { RequestHandler, Router }from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import {
    addRecipe,
    getAllRecipe
} from '../controller/recipeController'

const makeRouter = (
    dbClient: PrismaClient,
    authenticateUser: RequestHandler,
    uploadLogo: any
): Router => {
    const router = Router()

    // Add Product
    router.post('/', authenticateUser, addRecipe)

    // Get All Products
    router.get('/', authenticateUser, getAllRecipe)

    return router
}

export default makeRouter