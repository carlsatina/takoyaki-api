import prisma from '../../lib/prisma'

const getInventoryByType = async(req: any, res: any) => {
    
    let params = req.query.type

    const result = await prisma.inventory.findMany({
        where: {
            type: params
        },
        orderBy: {
            id: 'asc'
        }
    })
    res.status(200).json(result)
}

const getInventoryUsage = async (req: any, res: any) => {
  try {
    const { startDate, endDate } = req.query
    const start = startDate ? new Date(startDate as string) : null
    const end = endDate ? new Date(endDate as string) : null

    // Fetch all inventory so we can return zero-usage items as well
    const inventories = await prisma.inventory.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        current_stock: true,
        ingredient: { select: { unit: true } },
        packaging_id: true
      }
    })

    const saleItems = await prisma.saleItem.findMany({
      where: {
        sale: {
          date: {
            ...(start ? { gte: start } : {}),
            ...(end ? { lte: end } : {})
          }
        }
      },
      include: {
        product: {
          include: {
            recipe: {
              include: {
                recipe_items: {
                  include: {
                    ingredient: {
                      include: { inventory: true }
                    }
                  }
                }
              }
            },
            productPackagings: {
              include: {
                packaging: {
                  include: { inventory: true }
                }
              }
            }
          }
        }
      }
    })

    // Quick lookup helpers for packaging inventory fallback
    const inventoryByPackagingId = new Map<number, any>()
    const inventoryByName = new Map<string, any>()
    for (const inv of inventories) {
      if (inv.packaging_id) {
        inventoryByPackagingId.set(inv.packaging_id, inv)
      }
      inventoryByName.set(inv.name.toLowerCase(), inv)
    }

    const usageMap = new Map<number, number>()

    for (const item of saleItems) {
      const saleItem = item as any
      const qty = saleItem.quantity || 0
      // Ingredients via recipe
      const recipeItems = saleItem.product?.recipe?.recipe_items || []
      for (const rItem of recipeItems) {
        const inv = rItem.ingredient?.inventory
        if (!inv) continue
        const used = qty * (rItem.quantity || 0)
        usageMap.set(inv.id, (usageMap.get(inv.id) || 0) + used)
      }
      // Packaging via productPackagings
      const packagings = saleItem.product?.productPackagings || []
      for (const p of packagings as any[]) {
        let inv = p.packaging?.inventory
        // Fallback: if packaging.inventory is missing, try by packaging_id then by name
        if (!inv && p.packaging_id) {
          inv = inventoryByPackagingId.get(p.packaging_id)
        }
        if (!inv && p.packaging?.name) {
          inv = inventoryByName.get((p.packaging.name || '').toLowerCase())
        }
        if (!inv) continue
        // Use explicit per-sale quantity and fall back to 1 to ensure packaging shows in usage
        const perSaleQty = Number(p.packaging?.quantity ?? p.quantity ?? 1) || 1
        const used = qty * perSaleQty
        usageMap.set(inv.id, (usageMap.get(inv.id) || 0) + used)
      }
    }

    const result = inventories.map((inv) => ({
      id: inv.id,
      name: inv.name,
      type: inv.type,
      used_quantity: usageMap.get(inv.id) || 0,
      unit: inv.ingredient?.unit || '',
      current_stock: inv.current_stock || 0
    }))

    res.status(200).json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to compute inventory usage' })
  }
}

const updateInventoryStock = async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id)
    const { current_stock } = req.body
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid inventory id' })

    const updated = await prisma.inventory.update({
      where: { id },
      data: { current_stock: Number(current_stock) || 0 }
    })

    res.status(200).json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update inventory stock' })
  }
}

export {
    getInventoryByType,
    getInventoryUsage,
    updateInventoryStock
}
