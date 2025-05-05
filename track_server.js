import express from 'express'
import cors from 'cors'
import { showBus,showCity, showStops,showCorrectbus,showStartEnd } from './database.js'
const app = express()
app.use(cors())
app.use(express.json())
app.get('/city',async (req,res)=>{
    const data = await showCity()
    res.status(200).send(data)
})
app.get('/bus/:city',async (req,res)=>{
    const city = req.params.city
    const data = await showBus(city)
    res.status(200).send(data)
})
app.get('/buses',async (req,res)=>{
    console.log("Hiiiiii")
    const {from,to}=req.query;
    const data = await showCorrectbus(from,to);
    res.status(200).send(data)
})
app.get('/busPath/:busName',async (req,res)=>{
    const bus = req.params.busName
    const data =  await showStartEnd(bus)
    res.status(200).send(data)
})
app.get('/stops/:city',async (req,res)=>{
    const city =req.params.city
    // console.log("city : ",city)
    const data = await showStops(city)
    res.status(200).send(data)
})
app.use((err,req,res,next)=>{
    console.error(err.stack)
    res.status(500).send("Something  Broke !!!")
})
app.listen(3001,()=>{
    console.log(`SERVER RUNNING AT PORT 3001 !!!`);
    
})
