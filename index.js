const express = require('express');
const fileUpload = require("express-fileupload")


const cors = require("cors");
require("./db/confige")
const route = require("./routes/route")
const app = express()

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(fileUpload({
    useTempFiles : true,
}));


app.use('/', route);  


app.listen( process.env.PORT || 4000, function () {
    console.log(`Express app running on port ${process.env.PORT || 4000} `  ) 
});

 
