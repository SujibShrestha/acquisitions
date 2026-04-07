import { Router } from "express";
import { signUp } from "../controllers/auth.controller.js";

const router = Router()

router.post('/sign-up',signUp)
router.post('/sign-in',()=>{})
router.post('/sign-out',()=>{})

export default router