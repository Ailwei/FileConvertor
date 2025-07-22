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
const { StorageRouter } = require('./routes/trackStorage');
const bodyParser = require("body-parser")

dotenv.config();

//app.use(morgan('combined')); 
app.use(express.json())
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true
}))

app.use(morgan('dev'));
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/auth', UserRouter)
app.use('/auth', SubscriptionRouter)
app.use('/auth', ConvertRouter)
app.use('/auth', StorageRouter)

app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
})

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})
