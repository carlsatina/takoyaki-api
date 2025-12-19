import { Ingredient } from './../../node_modules/.prisma/client/index.d';
import { ExtendedRequest } from '../../extendedRequest'
import prisma from '../../lib/prisma'

const addRecipe = async(req: ExtendedRequest, res: any) => {
    let params = req.body

    try {
        const created = await prisma.recipe.create({
            data: {
                name: params.name,
                recipe_items: {
                    create: params.ingredients.map((item: any) => ({
                        quantity: item.quantity,
                        ingredient: {
                            connect: { id: item.id }
                        }
                    }))
                }
            },
            include: {
                recipe_items: {
                    include: {
                        ingredient: true
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

const getAllRecipe = async(req: any, res: any) => {
    
    const result = await prisma.recipe.findMany({
        orderBy: {
            id: 'asc'
        },
        include: {
            recipe_items: {
                include: {
                    ingredient: true
                }
            }
        }
    })
    res.status(200).json(result)
}


export {
    addRecipe,
    getAllRecipe
}