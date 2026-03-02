import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const router = Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploadsPath = path.join(__dirname, '../uploads')

// Crear carpeta si no existe
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath)
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsPath)
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname
        cb(null, uniqueName)
    }
})

const upload = multer({ storage })

// GET
router.get('/', (req, res) => {
    const success = req.query.success
    res.render('services', { success })
})

// POST
router.post(
    '/',
    upload.fields([
        { name: 'imagen1', maxCount: 1 },
        { name: 'imagen2', maxCount: 1 }
    ]),
    (req, res) => {

        try {

            const { empresa, tipo, fecha } = req.body

            const imagen1 = req.files?.imagen1?.[0]
            const imagen2 = req.files?.imagen2?.[0]

            if (!imagen1 || !imagen2) {
                return res.redirect('/services')
            }

            const data = {
                empresa,
                tipo,
                fecha,
                imagen1: imagen1.filename,
                imagen2: imagen2.filename,
                fechaRegistro: new Date()
            }

            const jsonFileName = `registro-${Date.now()}.json`
            const jsonPath = path.join(uploadsPath, jsonFileName)

            fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2))

            res.redirect('/services?success=1')

        } catch (error) {
            console.error(error)
            res.redirect('/services')
        }
    }
)

export default router