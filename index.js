const express = require('express');

//run database
require('./db/mongoose')

//start express
const app = express();

//user router
const userRouter = require('./routers/user');
//task router 
const taskRouter = require('./routers/task');
const User = require('./models/user');

//set middleware for parsing incoming json + wire up routers
app.use(express.json(), userRouter, taskRouter)

//setup port (heroku or fallback localhost)
const port = process.env.PORT 


app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})


// async function main(){
//     const user = await User.findById('60897f325ab39b1b38969461');
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }

// main()