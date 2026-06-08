import { ExtendedRequest } from '../../extendedRequest'
import prisma from '../../lib/prisma'

interface CartItem {
    product_id: number,
    product_name: string,
    quantity: number
}
const addSales = async(req: ExtendedRequest, res: any) => {
    let cart_items = req.body.CartItems
    let total_amount = req.body.total_amount
    let payment_mode = req.body.payment_mode
    let dine_mode = req.body.dine_mode

    try {

        const products = await prisma.product.findMany({
            where: {
                product_id: { in: cart_items.map((item: CartItem) => item.product_id) }
            }
        })

        const saleItemsData = cart_items.map((item: CartItem) => {
            const product = products.find(p => p.product_id === item.product_id)
            if (!product) throw new Error (`Product ${item.product_id} not found`)

            return {
                product_id: product.product_id,
                quantity: item.quantity,
                unit_price: product.price
            }
        })

        // const total = saleItemsData.reduce((sum: number, item: {unit_price: number; quantity: number}) => sum + item.unit_price * item.quantity)

        const sale = await prisma.sale.create({
            data: {
                total: total_amount,
                saleItems: {
                    create: saleItemsData
                },
                payment_mode: payment_mode,
                user_info: {
                    connect: {
                        id: req.user.id
                    }
                }
            },
            include: {
                saleItems:  {
                    include: {
                      product: {
                        include: {
                          productPackagings: true // Ensure that productPackagings is included here
                        }
                      }
                    }
                  },
                user_info: true
            }
        })
        const saleRecordDate = new Date(sale.date)
        saleRecordDate.setHours(0, 0, 0, 0)
        const saleItems = await prisma.saleItem.findMany({
            where: { sale_id: sale.id },
            include: {
              product: {
                include: {
                  recipe: {
                    include: { recipe_items: { include: { ingredient: true } } }
                  },
                  productPackagings: true
                }
              }
            }
          });

        // For Each Sale Items, Deduct Inventory
        for (const item of saleItems) {
            const quantitySold = item.quantity;
          
            // Deduct ingredients
            if (item.product.recipe) {
                for (const recipeItem of item.product.recipe.recipe_items) {
                    const deductionAmount = recipeItem.quantity * quantitySold;
                
                    const updatedInventory = await prisma.inventory.update({
                        where: { ingredient_id: recipeItem.ingredient_id },
                        data: {
                            current_stock: { decrement: deductionAmount }
                        }
                    });
                    await prisma.inventoryStartStock.upsert({
                        where: {
                            inventory_id_record_date: {
                                inventory_id: updatedInventory.id,
                                record_date: saleRecordDate
                            }
                        },
                        update: { start_stock: { decrement: deductionAmount } },
                        create: {
                            inventory_id: updatedInventory.id,
                            record_date: saleRecordDate,
                            start_stock: 0 - deductionAmount
                        }
                    })
                }
            }
            
            // Deduct packaging from inventory
            for (const productPackaging of item.product.productPackagings) {
                const packaging = await prisma.packaging.findUnique({
                    where: {
                        id: productPackaging.packaging_id
                    }
                })

                // TODO: This is just a temporary checking for bottle and cups and dine-in takeout mode.
                if (packaging && packaging.name.includes(dine_mode) || 
                    packaging?.name.toLowerCase().includes('bottle') ||
                    packaging?.name.toLowerCase().includes('cups') ||
                    packaging?.name.toLowerCase().includes('cover') ||
                    packaging?.name.toLowerCase().includes('stick')
                ){
                    const quantityNeeded = packaging.quantity * quantitySold;
        
                    // Deduct the quantity from the inventory for this packaging
                    const updatedInventory = await prisma.inventory.update({
                        where: { packaging_id: packaging.id },
                        data: {
                            current_stock: { decrement: quantityNeeded }
                        }
                    });
                    await prisma.inventoryStartStock.upsert({
                        where: {
                            inventory_id_record_date: {
                                inventory_id: updatedInventory.id,
                                record_date: saleRecordDate
                            }
                        },
                        update: { start_stock: { decrement: quantityNeeded } },
                        create: {
                            inventory_id: updatedInventory.id,
                            record_date: saleRecordDate,
                            start_stock: 0 - quantityNeeded
                        }
                    })
                }
            }
          }

        res.status(200).json(sale)
    }
    catch(err) {
        console.log("err: ", err)
    }

}

const getSales = async(req: any, res: any) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined
        const includeItems = req.query.includeItems === 'true'
        const paymentMode = req.query.paymentMode || req.query.payment_mode
        const startDate = req.query.startDate
        const endDate = req.query.endDate
        
        // Build where clause for date filtering
        const whereClause: any = {}
        if (paymentMode) {
            whereClause.payment_mode = paymentMode
        }
        if (startDate || endDate) {
            whereClause.date = {}
            if (startDate) {
                whereClause.date.gte = new Date(startDate)
            }
            if (endDate) {
                // Add one day to include the entire end date
                const endDateTime = new Date(endDate)
                endDateTime.setDate(endDateTime.getDate() + 1)
                whereClause.date.lt = endDateTime
            }
        }
        
        const result = await prisma.sale.findMany({
            ...(limit && { take: limit }),
            ...(Object.keys(whereClause).length > 0 && { where: whereClause }),
            orderBy: {
                id: 'desc'
            },
            include: {
                user_info: {
                    select: {
                        full_name: true
                    }
                },
                ...(includeItems && {
                    saleItems: {
                        include: {
                            product: {
                                select: {
                                    product_id: true,
                                    product_name: true,
                                    price: true,
                                    category: true
                                }
                            }
                        }
                    }
                })
            }
        })

        res.status(200).json(result)
    } catch(err) {
        console.log("err: ", err)
        res.status(500).json({ error: "Failed to fetch sales" })
    }
}

const getAllSales = async(req: any, res: any) => {
    
    const result = await prisma.sale.findMany({
        orderBy: {
            id: 'asc'
        },
        where: {
            user_id: req.user.id
        }
    })
    res.status(200).json(result)
}

const getLatestSalesId = async(req: any, res: any) => {
    
    const result = await prisma.sale.findFirst({
        select: {
            id: true
        },
        orderBy: {
            id: 'desc'
        }
    })
    res.status(200).json(result)
}


export {
    addSales,
    getSales,
    getAllSales,
    getLatestSalesId
}
