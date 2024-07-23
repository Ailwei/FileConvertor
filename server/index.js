const express = require('express');
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const morgan = require('morgan');
const {UserRouter} = require('./routes/user')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser');
const {SubscriptionRouter} = require('./routes/subscription');
const {ConvertRouter} = require('./routes/ConvertFile');
const upload = require('./middleware/multerConfig');
const bodyParser = require("body-parser")

dotenv.config();

app.use(express.json())
app.use(cors({
    origin: ["https://file-convertor-eight.vercel.app"],
    credentials: true
}))

app.use(morgan('dev'));
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', UserRouter)
app.use('/auth', SubscriptionRouter);
app.use('/auth', ConvertRouter)

app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
})

mongoose.connect('mongodb://127.0.0.1:27017/ProjectDb');

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})
