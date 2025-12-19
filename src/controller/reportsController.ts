import prisma from '../../lib/prisma'
import { startOfHour, format } from 'date-fns'
import { toZonedTime, format as tzFormat } from 'date-fns-tz'
import { userInfo } from 'os'

const getSalesByPaymentMode = async(req: any, res: any) => {
    const { startDate, endDate } = req.query

    const startDateObj = new Date(startDate)
    startDateObj.setHours(0, 0, 0, 0)

    const adjustedEndDate = new Date(endDate)
    adjustedEndDate.setHours(23, 59, 59, 999)

    const revenueByPaymentMode = await prisma.sale.groupBy({
        by: ['payment_mode'],
        where: {
            date: {
                gte: startDateObj,
                lt: adjustedEndDate
            }
        },
        _sum: {
          total: true
        },
        _count: {
          _all: true
        }
      });
  
      const result = revenueByPaymentMode.map(item => ({
        paymentMode: item.payment_mode,
        totalRevenue: item._sum.total,
        transactionCount: item._count._all
      }));

    // const jsonData = JSON.parse(`{"revenue":${revenue},"receipts":${numOfReceipts}}`)
    res.status(200).json(result)  
}

const getNumberOfReceipts = async(req: any, res: any) => {
    const { startDate, endDate } = req.query

    const startDateObj = new Date(startDate)
    startDateObj.setHours(0, 0, 0, 0)

    const adjustedEndDate = new Date(endDate)
    adjustedEndDate.setHours(23, 59, 59, 999)

    const salesCount = await prisma.sale.count({
        where: {
          date: {
            gte: startDateObj,
            lt: adjustedEndDate
          }
        }
      });

    // const jsonData = JSON.parse(`{"revenue":${revenue},"receipts":${numOfReceipts}}`)
    res.status(200).json(salesCount)  
}

const getSalesReport = async(req: any, res: any) => {
    const { startDate, endDate } = req.query

    const startDateObj = new Date(startDate)
    startDateObj.setHours(0, 0, 0, 0)

    const adjustedEndDate = new Date(endDate)
    adjustedEndDate.setHours(23, 59, 59, 999)


    // Get products with their sale quantities
    const products = await prisma.product.findMany({
        orderBy: [
            { category: 'desc' },
            { product_name: 'asc' }
        ],
        where: {
          saleItems: {
            some: {
              sale: {
                date: {
                  gte: startDateObj,
                  lt: adjustedEndDate
                }
              }
            }
          }
        },
        include: {
          saleItems: {
            where: {
              sale: {
                date: {
                  gte: startDateObj,
                  lt: adjustedEndDate
                }
              }
            },
            include: {
                sale: {
                    include: {
                        user_info: true
                    }
                }
            }
          }
        }
      });
  
        // 🧾 Count total number of receipts (sales)
        const totalReceipts = await prisma.sale.count({
            where: {
                date: {
                gte: startDateObj,
                lt: adjustedEndDate,
                },
            },
        });
      // Format the response
      const finalResult = products.map(product => {
        const totalSold = product.saleItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalRevenue = product.saleItems.reduce(
          (sum, item) => sum + (item.quantity * item.unit_price), 0
        );
        const totalProfit = product.saleItems.reduce(
          (sum, item) => sum + (item.quantity * product.cost), 0
        );
        return {
          productId: product.product_id,
          name: product.product_name,
          category: product.category,
          price: product.price,
          totalSold,
          totalRevenue,
          totalProfit,
          image: product.image
        };
      });

    // Sales per user with payment breakdown
    const userSalesRaw = await prisma.sale.findMany({
      where: {
        date: {
          gte: startDateObj,
          lt: adjustedEndDate
        }
      },
      select: {
        user_id: true,
        total: true,
        payment_mode: true
      }
    })

    const userSalesMap: Record<string, { total: number; cash_total: number; gcash_total: number }> = {}
    userSalesRaw.forEach((sale) => {
      if (!sale.user_id) return
      if (!userSalesMap[sale.user_id]) {
        userSalesMap[sale.user_id] = { total: 0, cash_total: 0, gcash_total: 0 }
      }
      userSalesMap[sale.user_id].total += sale.total || 0
      if (sale.payment_mode === 'Cash') {
        userSalesMap[sale.user_id].cash_total += sale.total || 0
      }
      if (sale.payment_mode === 'GCash') {
        userSalesMap[sale.user_id].gcash_total += sale.total || 0
      }
    })

    const userSalesReport = await Promise.all(
      Object.entries(userSalesMap).map(async ([userId, sums]) => {
        const user = await prisma.userInfo.findUnique({
          where: { id: Number(userId) },
          select: { full_name: true }
        })
        return {
          user_id: Number(userId),
          full_name: user?.full_name || null,
          total_sales: sums.total,
          cash_total: sums.cash_total,
          gcash_total: sums.gcash_total
        }
      })
    )

    // const jsonData = JSON.parse(`{"revenue":${revenue},"receipts":${numOfReceipts}}`)
    res.status(200).json({
        totalReceipts,
        products: finalResult,
        userSales: userSalesReport
    })

}

const getSalesByHour = async(req: any, res: any) => {
    const { startDate, endDate } = req.query

    const startDateObj = new Date(startDate)
    startDateObj.setHours(0, 0, 0, 0)

    const adjustedEndDate = new Date(endDate)
    adjustedEndDate.setHours(23, 59, 59, 999)

    const sales = await prisma.sale.findMany({
      where: {
        date: {
            gte: startDateObj,
            lt: adjustedEndDate
        }
      },
      select: {
        date: true,
        total: true
      }
    });

    // Aggregate sales per hour
    const hourlyMap: any = {};

    for (const sale of sales) {
      const timeZone = 'Asia/Manila'
      const hourLabel = format(toZonedTime(sale.date, timeZone), 'ha').toLocaleLowerCase();

      if (!hourlyMap[hourLabel]) {
        hourlyMap[hourLabel] = 0;
      }

      hourlyMap[hourLabel] += sale.total;
    }

    // Convert map to array
    const result = Object.entries(hourlyMap).map(([saleDate, totalRevenue]) => ({
      saleDate,
      totalRevenue,
    }));

    res.status(200).json(result)  

}

const getTopSellingItemByDateRange = async(req: any, res: any) => {
    const { startDate: startDateParam, endDate: endDateParam } = req.query

    // Validate date parameters
    if (!startDateParam || !endDateParam) {
        return res.status(400).json({ error: 'Start date and end date are required' })
    }

    // Parse and set up dates
    const startDate = new Date(startDateParam)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(endDateParam)
    endDate.setHours(23, 59, 59, 999)

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' })
    }

    if (startDate > endDate) {
        return res.status(400).json({ error: 'Start date must be before end date' })
    }

    try {
        // Get all sale items within the month with product details
        const saleItems = await prisma.saleItem.findMany({
            where: {
                sale: {
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            },
            include: {
                product: true
            }
        })

        // Group by product and calculate totals
        const productSales = new Map()

        saleItems.forEach(item => {
            const productId = item.product_id
            const productName = item.product.product_name
            const quantity = item.quantity
            const revenue = item.quantity * item.unit_price

            if (productSales.has(productId)) {
                const existing = productSales.get(productId)
                existing.totalQuantity += quantity
                existing.totalRevenue += revenue
                existing.orderCount += 1
            } else {
                productSales.set(productId, {
                    productId,
                    productName,
                    totalQuantity: quantity,
                    totalRevenue: revenue,
                    orderCount: 1,
                    category: item.product.category
                })
            }
        })

        // Convert to array and sort by total quantity sold
        const sortedProducts = Array.from(productSales.values())
            .sort((a, b) => b.totalQuantity - a.totalQuantity)

        // Get top selling item
        const topSellingItem = sortedProducts.length > 0 ? sortedProducts[0] : null

        // Calculate date range info
        const daysDifference = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

        const result = {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            dateRange: `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`,
            totalDays: daysDifference,
            topSellingItem,
            allProducts: sortedProducts
        }

        res.status(200).json(result)
    } catch (error) {
        console.error('Error fetching top selling item:', error)
        res.status(500).json({ error: 'Failed to fetch top selling item' })
    }
}

export {
    getSalesReport,
    getNumberOfReceipts,
    getSalesByPaymentMode,
    getSalesByHour,
    getTopSellingItemByDateRange
}
