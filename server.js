const mongoose = require("mongoose");
const express = require("express");
const app = express();
const cors = require("cors");

// Connect to the Database "ecommerce" in Robo3T
mongoose.connect(
  "mongodb+srv://12345:12345@ecom.beity.mongodb.net/ecom?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
  }
);

// Check if we are connected to the Database
mongoose.connection.once("open", () =>
  console.log("We are connected to the Database")
);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static("uploads"));

// Define the routes
app.use("/users", require("./routes/users"));
app.use("/items", require("./routes/items"));
app.use("/carts", require("./routes/carts"));
app.use("/orders", require("./routes/orders"));

app.listen(process.env.PORT || 4000, () => console.log(`App is listening in port ${process.env.PORT || 4000}`));
