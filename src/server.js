require('dotenv').config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const { sequelize } = require("./models"); 


const authRoutes = require("./routes/authRoutes");
const apiRoutes = require("./routes/apiRoutes");

require("./config/passport"); 

const app = express();
const PORT = process.env.PORT || 8081;


app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use("/auth", authRoutes); 
app.use("/api", apiRoutes);

app.listen(PORT, async () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
  try {

    await sequelize.authenticate();
    console.log("Kết nối database thành công!");
    
  } catch (error) {
    console.error("Không thể kết nối database:", error);
  }
});