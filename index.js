require("dotenv").config()
const express = require("express")
const multer = require("multer")
const { s3Uploadv2, s3Uploadv3 } = require("./s3Service")
const uuid = require("uuid").v4
const app = express()

// Single File Upload
// const upload = multer({dest: "uploads/"})
// app.post("/upload", upload.single("file"), (req,res) => {
//     res.json({status: "Success"})
// });

// Multiple File Upload
// const upload = multer({dest: "uploads/"})
// app.post("/upload", upload.array("file", 2) , (req,res) => {
//     res.json({status: "Success"})
// });

// Multiple fields uploads
// const upload = multer({ dest: "uploads/" })
// const multiUpload = upload.fields([{ name: "avatar", maxCount: 1 }, { name: "resume", maxCount: 1 },])
// app.post("/upload", multiUpload, (req, res) => {
//     console.log(req.files)
//     res.json({ status: "Success" })
// });

// Custom File Name / Multiple File Upload

// To Create Storage on Local Disk

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads/")
//     },
//     filename: (req, file, cb) => {
//         const { originalname } = file
//         cb(null, `${uuid()}-${originalname}`)
//     }
// })

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[0] === "image"){
        cb(null, true)
    } else {
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false)
    }
}

const upload = multer({storage, fileFilter, limits: { fileSize: 10000000 }})

// For use with version 2

// app.post("/upload", upload.array("file") , async (req,res) => {
//     try {
//         const results = await s3Uploadv2(req.files)
//         console.log(results)
//         res.json({status: "success"})
//     } catch (err) {
//         console.log(err)
//     }
// });

// For use with version 3

app.post("/upload", upload.array("file") , async (req,res) => {
    const file = req.files[0]
    try {
        const results = await s3Uploadv3(req.files)
        console.log(results)
        res.json({status: "success"})
    } catch (err) {
        console.log(err)
    }
});

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message: "file is too large"
            })
        }
        if (error.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                message: "file limit reached"
            })
        }
        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                message: "file must be an image"
            })
        }
    }
})

app.listen(4000, () => console.log("Listening on port 4000"))