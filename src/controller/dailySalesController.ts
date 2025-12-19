import { ExtendedRequest } from '../../extendedRequest'
import prisma from '../../lib/prisma'

// Convert incoming values to numbers or undefined so Prisma receives the right types
const toNumberOrUndefined = (val: any) => {
  if (val === undefined || val === null || val === '') return undefined
  const num = Number(val)
  return Number.isNaN(num) ? undefined : num
}

const toNonNegativeInt = (val: any) => {
  if (val === undefined || val === null || val === '') return 0
  const num = Number(val)
  if (!Number.isFinite(num)) return 0
  return Math.max(0, Math.trunc(num))
}

const toNonNegativeFloat = (val: any) => {
  if (val === undefined || val === null || val === '') return 0
  const num = Number(val)
  if (!Number.isFinite(num)) return 0
  return Math.max(0, num)
}

const computeCashOnHandFromDenoms = (entry: any) => {
  const bill_500 = toNonNegativeInt(entry.bill_500)
  const bill_200 = toNonNegativeInt(entry.bill_200)
  const bill_100 = toNonNegativeInt(entry.bill_100)
  const bill_50 = toNonNegativeInt(entry.bill_50)
  const bill_20 = toNonNegativeInt(entry.bill_20)
  const coins = toNonNegativeFloat(entry.coins)

  const hasBreakdown =
    bill_500 > 0 ||
    bill_200 > 0 ||
    bill_100 > 0 ||
    bill_50 > 0 ||
    bill_20 > 0 ||
    coins > 0

  const computed =
    bill_500 * 500 +
    bill_200 * 200 +
    bill_100 * 100 +
    bill_50 * 50 +
    bill_20 * 20 +
    coins

  return {
    bill_500,
    bill_200,
    bill_100,
    bill_50,
    bill_20,
    coins,
    hasBreakdown,
    computed
  }
}

const addDailySales = async (req: ExtendedRequest, res: any) => {
  const payload = req.body
  let staffCashEntries = Array.isArray(payload.staff_cash_entries)
    ? payload.staff_cash_entries
    : []

  try {
    // Autopopulate staff cash entries from existing staff users if none were provided
    if (staffCashEntries.length === 0) {
      const staffUsers = await prisma.userInfo.findMany({
        where: { role: 'Staff' },
        select: { id: true }
      })
      staffCashEntries = staffUsers.map((u) => ({
        staff_id: u.id,
        cash_on_hand: 0,
        gcash: 0,
        bill_500: 0,
        bill_200: 0,
        bill_100: 0,
        bill_50: 0,
        bill_20: 0,
        coins: 0
      }))
    }

    const dailySales = await prisma.dailySales.create({
      data: {
        ...(payload.record_date && { record_date: new Date(payload.record_date) }),
        expense: toNumberOrUndefined(payload.expense),
        total_cash_on_hand: toNumberOrUndefined(payload.total_cash_on_hand),
        total_gcash: toNumberOrUndefined(payload.total_gcash),
        total_sales: toNumberOrUndefined(payload.total_sales),
        senior_discount: toNumberOrUndefined(payload.senior_discount),
        pos_cash_on_hand: toNumberOrUndefined(payload.pos_cash_on_hand),
        actual_cash_on_hand: toNumberOrUndefined(payload.actual_cash_on_hand),
        cash_goal: toNumberOrUndefined(payload.cash_goal),
        cash_needed_for_goal: toNumberOrUndefined(payload.cash_needed_for_goal),
        ...(staffCashEntries.length > 0 && {
          staffCashEntries: {
            create: staffCashEntries.map((entry: any) => {
              const denom = computeCashOnHandFromDenoms(entry)
              return {
                staff_id: entry.staff_id,
                cash_on_hand: denom.hasBreakdown
                  ? denom.computed
                  : (toNumberOrUndefined(entry.cash_on_hand) ?? 0),
                gcash: toNumberOrUndefined(entry.gcash) ?? 0,
                bill_500: denom.bill_500,
                bill_200: denom.bill_200,
                bill_100: denom.bill_100,
                bill_50: denom.bill_50,
                bill_20: denom.bill_20,
                coins: denom.coins
              }
            })
          }
        })
      },
      include: {
        staffCashEntries: true
      }
    })

    // Ensure staff have the Staff role set
    if (staffCashEntries.length > 0) {
      const staffIds = staffCashEntries
        .map((entry: any) => entry.staff_id)
        .filter((id: any) => typeof id === 'number')

      if (staffIds.length) {
        await prisma.userInfo.updateMany({
          where: { id: { in: staffIds } },
          data: { role: 'Staff' }
        })
      }
    }

    res.status(200).json(dailySales)
  } catch (err) {
    console.log('err: ', err)
    res.status(500).json({ error: 'Failed to create daily sales record' })
  }
}

const getDailySales = async (req: any, res: any) => {
  try {
    const result = await prisma.dailySales.findMany({
      orderBy: { record_date: 'desc' },
      include: { staffCashEntries: true }
    })

    res.status(200).json(result)
  } catch (err) {
    console.log('err: ', err)
    res.status(500).json({ error: 'Failed to fetch daily sales' })
  }
}

const getDailySalesById = async (req: any, res: any) => {
  const id = parseInt(req.params.id)

  try {
    const result = await prisma.dailySales.findUnique({
      where: { id },
      include: { staffCashEntries: true }
    })

    if (!result) {
      return res.status(404).json({ error: 'Daily sales record not found' })
    }

    res.status(200).json(result)
  } catch (err) {
    console.log('err: ', err)
    res.status(500).json({ error: 'Failed to fetch daily sales record' })
  }
}

const updateDailySales = async (req: any, res: any) => {
  const id = parseInt(req.params.id)
  const payload = req.body
  const hasStaffCashEntries = Array.isArray(payload.staff_cash_entries)
  const staffCashEntries = hasStaffCashEntries ? payload.staff_cash_entries : []

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.dailySales.update({
        where: { id },
        data: {
          ...(payload.record_date && { record_date: new Date(payload.record_date) }),
          expense: toNumberOrUndefined(payload.expense),
          total_cash_on_hand: toNumberOrUndefined(payload.total_cash_on_hand),
          total_gcash: toNumberOrUndefined(payload.total_gcash),
          total_sales: toNumberOrUndefined(payload.total_sales),
          senior_discount: toNumberOrUndefined(payload.senior_discount),
          pos_cash_on_hand: toNumberOrUndefined(payload.pos_cash_on_hand),
          actual_cash_on_hand: toNumberOrUndefined(payload.actual_cash_on_hand),
          cash_goal: toNumberOrUndefined(payload.cash_goal),
          cash_needed_for_goal: toNumberOrUndefined(payload.cash_needed_for_goal)
        }
      })

      if (hasStaffCashEntries) {
        await tx.dailySalesStaffCash.deleteMany({ where: { daily_sales_id: id } })
        if (staffCashEntries.length) {
          await tx.dailySalesStaffCash.createMany({
            data: staffCashEntries.map((entry: any) => {
              const denom = computeCashOnHandFromDenoms(entry)
              return {
                daily_sales_id: id,
                staff_id: entry.staff_id,
                cash_on_hand: denom.hasBreakdown
                  ? denom.computed
                  : (toNumberOrUndefined(entry.cash_on_hand) ?? 0),
                gcash: toNumberOrUndefined(entry.gcash) ?? 0,
                bill_500: denom.bill_500,
                bill_200: denom.bill_200,
                bill_100: denom.bill_100,
                bill_50: denom.bill_50,
                bill_20: denom.bill_20,
                coins: denom.coins
              }
            })
          })

          const staffIds = staffCashEntries
            .map((entry: any) => entry.staff_id)
            .filter((staffId: any) => typeof staffId === 'number')

          if (staffIds.length) {
            await tx.userInfo.updateMany({
              where: { id: { in: staffIds } },
              data: { role: 'Staff' }
            })
          }
        }
      }

      return tx.dailySales.findUnique({
        where: { id },
        include: { staffCashEntries: true }
      })
    })

    res.status(200).json(result)
  } catch (err) {
    console.log('err: ', err)
    res.status(500).json({ error: 'Failed to update daily sales record' })
  }
}

const deleteDailySales = async (req: any, res: any) => {
  const id = parseInt(req.params.id)

  try {
    await prisma.dailySales.delete({ where: { id } })
    res.status(200).json({ message: 'Daily sales record deleted' })
  } catch (err) {
    console.log('err: ', err)
    res.status(500).json({ error: 'Failed to delete daily sales record' })
  }
}

export {
  addDailySales,
  getDailySales,
  getDailySalesById,
  updateDailySales,
  deleteDailySales
}
