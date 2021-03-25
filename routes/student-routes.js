const express = require("express");
const {
  addStudent,
  getAllStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  postOrder,
  payment,
  paymentNotif,
  updateOrder,
} = require("../controllers/studentController");

const router = express.Router();

router.post("/student", addStudent);
router.post("/order", postOrder);
router.post("/payment", payment);
router.get("/payment/notification", paymentNotif);
router.get("/students", getAllStudents);
router.get("/student/:id", getStudent);
router.put("/student/:id", updateStudent);
router.put("/order/:id", updateOrder);
router.delete("/student/:id", deleteStudent);

module.exports = {
  routes: router,
};
