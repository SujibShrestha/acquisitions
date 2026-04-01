import express from 'express'

const app = express()

app.get("/",(req,res)=>{
    res.status(200).json("Api is running")
})

export default app