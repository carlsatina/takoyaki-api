import { RequestHandler, Router }from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import {
    addIngredient,
    getAllIngredient,
    getIngredientById,
    editIngredient
} from '../controller/ingredientController'

const makeRouter = (
    dbClient: PrismaClient,
    authenticateUser: RequestHandler,
    uploadLogo: any
): Router => {
    const router = Router()

    // Add Product
    router.post('/', authenticateUser, addIngredient)

    // Get All Products
    router.get('/', authenticateUser, getAllIngredient)

    // Get Ingredient by Id
    router.get('/:id', getIngredientById)

    // Edit Ingredient
    router.put('/:id', editIngredient)

    
    return router
}

export default makeRouter