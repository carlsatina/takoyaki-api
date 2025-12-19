import { ExtendedRequest } from '../../extendedRequest'
import prisma from '../../lib/prisma'

const addIngredient = async(req: ExtendedRequest, res: any) => {
    let params = req.body

    try {
        const created = await prisma.ingredient.create({
            data: {
                name: params.name,
                unit: params.unit,
                inventory: {
                    create: {
                        name: params.name,
                        type: "Ingredient",
                        current_stock: 0,
                        low_stock_level: 0
                    }
                }
            }
        })

        res.status(200).json(created)
        // res.status(200).json("{message: done}")
    } catch (err) {
        console.log("Err: ", err)
    }
}

const getAllIngredient = async(req: any, res: any) => {
    
    const result = await prisma.ingredient.findMany({
        orderBy: {
            id: 'asc'
        }
    })
    res.status(200).json(result)
}


const getIngredientById = async(req: any, res: any) => {
    const ingredientId = parseInt(req.params.id)
    
    const result = await prisma.ingredient.findUnique({
        where: {
            id: ingredientId
        }
    })
    res.status(200).json(result)
}

const editIngredient = async(req: any, res: any) => {
    const ingredientId = parseInt(req.params.id)
    const ingredientInfo = req.body

    const result = await prisma.ingredient.update({
        where: { id: ingredientId },
        data: ingredientInfo
    })
    res.status(200).json(result)
}

export {
    addIngredient,
    getAllIngredient,
    getIngredientById,
    editIngredient
}