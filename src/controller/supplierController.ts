import { ExtendedRequest } from '../../extendedRequest'
import prisma from '../../lib/prisma'

const addSupplier = async(req: ExtendedRequest, res: any) => {
    let params = req.body

    try {
        const created = await prisma.supplier.create({
            data: {
                name: params.name,
                contact_info: params.contact_info,
                address: params.address
            },
        });

        res.status(200).json(created)
    } catch (err) {
        console.log("Err: ", err)
    }
}

const getAllSupplier = async(req: any, res: any) => {
    
    const result = await prisma.supplier.findMany({
        orderBy: {
            id: 'asc'
        }
    })
    res.status(200).json(result)
}

const getSupplierById = async(req: any, res: any) => {
    const supplierId = parseInt(req.params.id)
    
    const result = await prisma.supplier.findUnique({
        where: {
            id: supplierId
        }
    })
    res.status(200).json(result)
}

const editSupplier = async(req: any, res: any) => {
    const supplierId = parseInt(req.params.id)
    const supplierInfo = req.body

    const result = await prisma.supplier.update({
        where: { id: supplierId },
        data: supplierInfo
    })
    res.status(200).json(result)
}


export {
    addSupplier,
    getAllSupplier,
    getSupplierById,
    editSupplier
}