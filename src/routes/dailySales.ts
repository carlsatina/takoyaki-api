import { RequestHandler, Router } from 'express'
import { PrismaClient } from '@prisma/client'
import {
  addDailySales,
  getDailySales,
  getDailySalesById,
  updateDailySales,
  deleteDailySales
} from '../controller/dailySalesController'

const makeRouter = (
  dbClient: PrismaClient,
  authenticateUser: RequestHandler
): Router => {
  const router = Router()

  router.post('/', authenticateUser, addDailySales)
  router.get('/', authenticateUser, getDailySales)
  router.get('/:id', authenticateUser, getDailySalesById)
  router.put('/:id', authenticateUser, updateDailySales)
  router.delete('/:id', authenticateUser, deleteDailySales)

  return router
}

export default makeRouter
