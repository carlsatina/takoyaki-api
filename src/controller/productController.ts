import { Packaging, Product } from './../../node_modules/.prisma/client/index.d';
import { ExtendedRequest } from '../../extendedRequest'
import prisma from '../../lib/prisma'
import { uploadLogo } from '../middlewares/uploadLogo'

const addProduct = async(req: ExtendedRequest, res: any) => {
    let params = req.body

    try {
        // Step 2: Create the product
        const created = await prisma.product.create({
          data: {
            product_name: params.Products.product_name,
            category: params.Products.category,
            cost: parseFloat(params.Products.cost),
            price: parseFloat(params.Products.sell_price),
            recipe: {
                connect: { id: params.Products.recipe_id }
            },
            productPackagings: {
                create: params.Packaging.map((item: any) => ({
                    packaging: { connect: { id: item }}
                }))
            },
          },
          include: {
            productPackagings: {
              include: {
                packaging: true,
              },
            },
          },
        });

        res.status(200).json(created)
        // res.status(200).json("{message: done}")
    } catch (err) {
        console.log("Err: ", err)
    }
}

const getAllProduct = async(req: any, res: any) => {
    
    const result = await prisma.product.findMany({
        orderBy: [
            { category: 'asc' },
            { product_name: 'asc' }
        ]
    })
    res.status(200).json(result)
}


export {
    addProduct,
    getAllProduct
}