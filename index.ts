import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { uploadLogo } from './src/middlewares/uploadLogo';

import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

// Routes
import productRouter from './src/routes/products'
import salesRouter from './src/routes/sales'
import authRouter from './src/routes/auth'
import reportsRouter from './src/routes/reports'
import ingredientRouter from './src/routes/ingredient'
import packagingRouter from './src/routes/packaging'
import recipeRouter from './src/routes/recipe'
import purchaseRouter from './src/routes/purchase'
import supplierRouter from './src/routes/supplier'
import inventoryRouter from './src/routes/inventory'
import expenseRouter from './src/routes/expense'
import dailySalesRouter from './src/routes/dailySales'
import settingsRouter from './src/routes/settings'
import dbClient from './lib/prisma'


dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:8080,http://localhost,capacitor://localhost,https://takpos-web.arshii.net,https://takpos-api.arshii.net')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}))
app.use(express.static('public'))
app.use(express.json())

app.use('/logo', express.static("./uploaded-images/logo"))
app.use('/portfolio', express.static("./uploaded-images/portfolio"))

app.get('/', (req, res) => {
    res.send("Hello World!")
})

function authenticateUser (req:any, res:any , next: any) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) {
        console.log("token is Null!")
        return res.status(400)
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'defaultSecret', (err: any, user: any) => {
        if (err) return res.status(403)
        req.user = user
        next()
    })
}

app.use('/api/v1/products', productRouter(dbClient, authenticateUser, uploadLogo))
app.use('/api/v1/sales', salesRouter(dbClient, authenticateUser))
app.use('/api/v1/auth', authRouter(dbClient, authenticateUser))
app.use('/api/v1/reports', reportsRouter(dbClient, authenticateUser))
app.use('/api/v1/ingredients', ingredientRouter(dbClient, authenticateUser, uploadLogo))
app.use('/api/v1/packaging', packagingRouter(dbClient, authenticateUser, uploadLogo))
app.use('/api/v1/recipe', recipeRouter(dbClient, authenticateUser, uploadLogo))
app.use('/api/v1/purchase', purchaseRouter(dbClient, authenticateUser, uploadLogo))
app.use('/api/v1/supplier', supplierRouter(dbClient, authenticateUser, uploadLogo))
app.use('/api/v1/inventory', inventoryRouter(dbClient, authenticateUser, uploadLogo))
app.use('/api/v1/expense', expenseRouter(dbClient, authenticateUser, uploadLogo))
app.use('/api/v1/daily-sales', dailySalesRouter(dbClient, authenticateUser))
app.use('/api/v1/settings', settingsRouter(dbClient, authenticateUser))

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "REST api for Health Records Documentation",
            version: "1.0.0"
        },
        schemes: ["http", "https"],
        servers: [
            {
                url: `${process.env.API_DOC_URL}:${port}`
            }
        ]
    },
    apis: ["./apis/*.ts"]
}
const spacs = swaggerJSDoc(options)
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(spacs)
)
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
