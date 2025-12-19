
import prisma from '../../lib/prisma'
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import { ExtendedRequest } from '../../extendedRequest'

dotenv.config()

const googleLogin = async (req: any, res: any) => {

    const input = req.body
    const {email, sub, name} = input

    let user = await prisma.userInfo.findFirst({
        where: {
            google_id: sub
        }
    })

    if (user) {
        // user Exist
        const userObj = {
            id: user.id,
            google_id: user.google_id,
            full_name: user.full_name,
            email: user.email,
            role: user.is_admin
        }
        const accessToken = jwt.sign(userObj, process.env.ACCESS_TOKEN_SECRET || 'defaultSecret1234')
        res.status(201).json({
            status: 201,
            token: accessToken
        })
    } else {
        // Create User
        try {
            const user = await prisma.userInfo.create({
                data: {
                    google_id: sub,
                    email: email,
                    full_name: name,
                }
            })

            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET || 'defaultSecret1234')
            res.status(201).json({
                status: 201,
                token: accessToken
            })
        } catch (err) {
            console.log("google Login err: ", err)
            res.status(401).json({
                status: 401,
                message: err
            })
        }
    }
}

const fbLogin = async (req: any, res: any) => {

    const input = req.body
    const { facebookId, name } = input

    // Find if facebookID exist in DB.
    let user = await prisma.userInfo.findFirst({
        where: {
            facebook_id: facebookId
        }
    })
    if (user) {
        // user exist
        const userObj = {
            id: user.id,
            facebook_id: facebookId,
            full_name: user.full_name,
            is_admin: user.is_admin
        }
        const accessToken = jwt.sign(userObj, process.env.ACCESS_TOKEN_SECRET || 'defaultSecret1234')
        res.status(201).json({
            status: 201,
            token: accessToken
        })
    } else {
        // User Does not exist. Create one for DB
        try {
            const user = await prisma.userInfo.create({
                data: {
                    facebook_id: facebookId,
                    full_name: name,
                }
            })

            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET || 'defaultSecret1234')
            res.status(201).json({
                status: 201,
                token: accessToken
            })
        } catch (err) {
            console.log("fb Login err: ", err)
            res.status(401).json({
                status: 401,
                message: err
            })
        }
    }
}

const login = async(req: any, res: any) => {

    const input = req.body
    const { email, password } = input

    let user = await prisma.userInfo.findFirst({
        where: {
            email
        }
    })

    if (user) {
        if (await bcrypt.compare(password, user.password || '')) {
            const userObj = { 
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                is_admin: user.is_admin,
                role: user.role
             }
            const accessToken = jwt.sign(userObj, process.env.ACCESS_TOKEN_SECRET || 'defaultSecret1234')
            res.json({
                status: 201,
                token: accessToken
            })
        } else {
            res.status(403).json({
                status: 403,
                message: 'User credentials does not match!'
            })
        }
    } else {
        res.status(400).json({
            status: 400,
            message: 'User does not exist!'
        })
    }
}

// a bcrypt configuration
const saltRounds = 10
const register = async (req: any, res: any) => {
    let hashedPassword = ''
    const input = req.body

    try {
        if (input.password != input.verifyPassword) {
            return res.status(400).json({
                status: 400,
                message: "Verify Password does not match"
            })
        } else {
            hashedPassword = await bcrypt.hash(input.password, saltRounds)
        }
    } catch (err: any) {
        res.status(400).json({
            status: 400,
            message: err.message
        })
    }
    delete input.verifyPassword
    input.password = hashedPassword

    try {
        // create the user
        const user = await prisma.userInfo.create({
            data: {
                ...input
            }
        })
        res.status(201).json({
            status: 201,
            message: "Registration successful!"
        })
    } catch (e) {
        console.log("error: ", e)
    }
}

const getProfile = async (req: ExtendedRequest, res: any) => {
    if (req.user) {
        res.status(201).json({
            status: 201,
            userInfo: req.user
        })
    } else {
        res.status(401).json({
            status: 401,
            message: "User does not exist!"
        })
    }
}

const listAccounts = async(req: ExtendedRequest, res: any) => {
    try {
        // create the user
        const user = await prisma.userInfo.findMany({
            orderBy: {
                id: 'asc'
            },
            where: {
                is_admin: false
            }
        })

        res.status(201).json({
            status: 201,
            userInfo: user
        })
    } catch (e) {
        console.log("error: ", e)
    }
}

const editAccount = async(req: ExtendedRequest, res: any) => {
    try {
        const { id, role } = req.body;

        if (!id || !role) {
            return res.status(400).json({ message: "User ID and role are required" });
        }

        const user = await prisma.userInfo.update({
            where: { id: Number(id) },
            data: { role },
        });

        res.status(200).json({
            status: 200,
            message: "User role updated",
            userInfo: user,
        });
    } catch (e) {
        console.error("error: ", e);
        res.status(500).json({ message: "Internal server error" });
    }
}


export {
    googleLogin,
    fbLogin,
    login,
    register,
    getProfile,
    listAccounts,
    editAccount
}