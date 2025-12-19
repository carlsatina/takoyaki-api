import { ExtendedRequest } from '../../extendedRequest'
import prisma from '../../lib/prisma'

const addPurchase = async(req: ExtendedRequest, res: any) => {
    let params = req.body

    try {

        const createdPurchase = await prisma.purchase.create({
            data: {
              invoice_number: params.purchase.invoice_no,
              supplier: {
                connect: { id: params.purchase.supplier_id }
              },
              purchase_date: params.purchase.date,
              items: {
                create: params.purchaseItems.map((item: any) => ({
                    category: item.category,
                    quantity: item.quantity,
                    unit_price: item.price,
                    total_price: item.price * item.quantity,
                    ingredient_id: item.ingredient_id,
                    packaging_id: item.packaging_id
                }))
              }
            },
        });

        // Update invetory stocks
        for (const item of params.purchaseItems) {
            if (item.category === "Ingredient" && item.ingredient_id) {
                await prisma.inventory.update({
                    where: {
                        ingredient_id: item.ingredient_id
                    },
                    data: {
                        current_stock: { increment: item.quantity }
                    }
                })
            } else if (item.category === "Packaging" && item.packaging_id) {
                await prisma.inventory.update({
                    where: { packaging_id: item.packaging_id },
                    data: {
                    current_stock: { increment: item.quantity },
                    },
                });
            }
        }

        res.status(200).json(createdPurchase)
        // res.status(200).json({'Message':"success"})
    } catch (err) {
        console.log("Err: ", err)
    }
}

const getAllPurchase = async(req: any, res: any) => {
    
    const result = await prisma.purchase.findMany({
        include: {
        items: {
            include: {
            ingredient: true,
            packaging: true,
            },
        },
        supplier: true,
        },
        orderBy: {
        purchase_date: 'desc',
        },
    })
    res.status(200).json(result)
}


export {
    addPurchase,
    getAllPurchase
}