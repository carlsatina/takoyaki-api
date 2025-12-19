import { RequestHandler, Router } from 'express'
import { PrismaClient } from '@prisma/client'
import {
  getAllSettings,
  addSettings,
  updateSettings,
  deleteSettings,
  getSettingsById
} from '../controller/settingsController'

const makeRouter = (
  _dbClient: PrismaClient,
  authenticateUser: RequestHandler
): Router => {
  const router = Router()

  router.get('/', authenticateUser, getAllSettings)
  router.get('/:id', authenticateUser, getSettingsById)
  router.post('/', authenticateUser, addSettings)
  router.put('/:id', authenticateUser, updateSettings)
  router.delete('/:id', authenticateUser, deleteSettings)

  return router
}

export default makeRouter
