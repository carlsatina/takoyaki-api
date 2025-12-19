import { ExtendedRequest } from '../../extendedRequest'
import prisma from '../../lib/prisma'

const getAllSettings = async (_req: any, res: any) => {
  const settings = await prisma.settings.findMany({ orderBy: { id: 'asc' } })
  res.status(200).json(settings)
}

const addSettings = async (req: ExtendedRequest, res: any) => {
  const payload = req.body
  const created = await prisma.settings.create({
    data: {
      daily_sales_goal: payload.daily_sales_goal ?? 0,
      monthly_sales_goal: payload.monthly_sales_goal ?? 0
    }
  })
  res.status(200).json(created)
}

const updateSettings = async (req: any, res: any) => {
  const id = parseInt(req.params.id)
  const payload = req.body
  const updated = await prisma.settings.update({
    where: { id },
    data: {
      daily_sales_goal: payload.daily_sales_goal ?? undefined,
      monthly_sales_goal: payload.monthly_sales_goal ?? undefined
    }
  })
  res.status(200).json(updated)
}

const deleteSettings = async (req: any, res: any) => {
  const id = parseInt(req.params.id)
  await prisma.settings.delete({ where: { id } })
  res.status(200).json({ message: 'deleted' })
}

const getSettingsById = async (req: any, res: any) => {
  const id = parseInt(req.params.id)
  const setting = await prisma.settings.findUnique({ where: { id } })
  res.status(200).json(setting)
}

export {
  getAllSettings,
  addSettings,
  updateSettings,
  deleteSettings,
  getSettingsById
}
