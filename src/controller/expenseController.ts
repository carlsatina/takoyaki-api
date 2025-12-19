import { ExtendedRequest } from '../../extendedRequest'
import prisma from '../../lib/prisma'

const addExpense = async(req: ExtendedRequest, res: any) => {
    let params = req.body

    try {
        const expense = await prisma.expense.create({
            data: {
                description: params.expense.description,
                expense_date: new Date(params.expense.expense_date),
                cost: params.expense.cost
            }
          });

        res.status(200).json(expense)
    } catch (err) {
        console.log("Err: ", err)
    }
}

const getAllExpense = async(req: any, res: any) => {
    
    const result = await prisma.expense.findMany({
        orderBy: {
            id: 'desc'
        }
    })
    res.status(200).json(result)
}


const getExpenseByid = async(req: any, res: any) => {
    const expenseId = parseInt(req.params.id)
    
    const result = await prisma.expense.findUnique({
        where: {
            id: expenseId
        }
    })
    res.status(200).json(result)
}

const editExpense = async(req: any, res: any) => {
    const expenseId = parseInt(req.params.id)
    const expenseInfo = req.body

    const result = await prisma.packaging.update({
        where: { id: expenseId },
        data: expenseInfo
    })
    res.status(200).json(result)
}

export {
    addExpense,
    getAllExpense,
    getExpenseByid,
    editExpense
}