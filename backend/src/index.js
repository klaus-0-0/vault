const express = require("express")
const cors = require("cors")
const app = express();
const PORT = 3000;

const auth = require("./auth");
 
app.use(cors({
    origin: "https://vault-front-bas3.onrender.com",
    credentials: true
})); 

app.use(express.json()); 
app.use("/api", auth); 

app.get("/", (req, res) => {
    console.log("sucess");
    res.status(200).json({ message: "success" })
})
 
app.listen(PORT, () => {
    console.log(`app is running on PORT ${PORT}`)
}) 
