import { Router } from "express";


const router = Router ()


router.get(`/`, (req,res) => {
    res.render(`home`, {title: `inicio`})
})





export default router