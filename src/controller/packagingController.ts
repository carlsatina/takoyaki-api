import { ExtendedRequest } from '../../extendedRequest'
import prisma from '../../lib/prisma'

const addPackaging = async(req: ExtendedRequest, res: any) => {
    let params = req.body

    try {
        const packaging = await prisma.packaging.create({
            data: {
              name: params.name,
              quantity: params.quantity,
              inventory: {
                create: {
                  name: params.name,
                  type: "Packaging",
                  current_stock: 0,
                  low_stock_level: 0
                },
              },
            },
          });

        res.status(200).json(packaging)
    } catch (err) {
        console.log("Err: ", err)
    }
}

const getAllPackaging = async(req: any, res: any) => {
    
    const result = await prisma.packaging.findMany({
        orderBy: {
            id: 'asc'
        }
    })
    res.status(200).json(result)
}


const getPackagingByid = async(req: any, res: any) => {
    const packagingId = parseInt(req.params.id)
    
    const result = await prisma.packaging.findUnique({
        where: {
            id: packagingId
        }
    })
    res.status(200).json(result)
}

const editPackaging = async(req: any, res: any) => {
    const packagingId = parseInt(req.params.id)
    const packagingInfo = req.body

    const result = await prisma.packaging.update({
        where: { id: packagingId },
        data: packagingInfo
    })
    res.status(200).json(result)
}

export {
    addPackaging,
    getAllPackaging,
    getPackagingByid,
    editPackaging
}