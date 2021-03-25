"use strict";

const firebase = require("../db");
const Student = require("../models/student");
const { createPayment } = require("../models/payment");
const firestore = firebase.firestore();

const midtransClient = require("midtrans-client");

const admin = require("firebase-admin");

const serviceAccount = require("../crude-firebase-nodejs-firebase-adminsdk-lpjfn-3ee926cfa9.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://crude-firebase-nodejs.firebaseio.com",
});

module.exports = {
  addStudent: async (req, res, next) => {
    try {
      const data = req.body;
      await firestore.collection("students").doc().set(data);
      res.send("Record saved successfuly");
    } catch (error) {
      res.status(400).send(error.message);
    }
  },

  getAllStudents: async (req, res, next) => {
    try {
      const students = await firestore.collection("students");
      const data = await students.get();
      const studentsArray = [];
      if (data.empty) {
        res.status(404).send("No student record found");
      } else {
        data.forEach((doc) => {
          const student = new Student(
            doc.id,
            doc.data().firstName,
            doc.data().lastName,
            doc.data().fatherName,
            doc.data().class,
            doc.data().age,
            doc.data().phoneNumber,
            doc.data().subject,
            doc.data().year,
            doc.data().semester,
            doc.data().status
          );
          studentsArray.push(student);
        });
        res.send(studentsArray);
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
  },
  getStudent: async (req, res, next) => {
    try {
      const id = req.params.id;
      const student = await firestore.collection("students").doc(id);
      const data = await student.get();
      if (!data.exists) {
        res.status(404).send("Student with the given ID not found");
      } else {
        res.send(data.data());
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
  },
  updateStudent: async (req, res, next) => {
    try {
      const id = req.params.id;
      const data = req.body;
      const student = await firestore.collection("students").doc(id);
      await student.update(data);
      res.send("Student record updated successfuly");
    } catch (error) {
      res.status(400).send(error.message);
    }
  },
  deleteStudent: async (req, res, next) => {
    try {
      const id = req.params.id;
      await firestore.collection("students").doc(id).delete();
      res.send("Record deleted successfuly");
    } catch (error) {
      res.status(400).send(error.message);
    }
  },
  postOrder: async (req, res) => {
    try {
      const bookingId = new Date().getTime().toString().slice(5) * 76543;
      const { nominal } = req.body;
      const data = {
        nominal,
        status: "UNPAID",
      };
      await firestore.collection("orders").doc().set(data);
      res.send("BOOKING saved successfuly");
    } catch (error) {
      res.status(400).send(error.message);
    }
  },
  payment: async (req, res) => {
    try {
      const bookingId = new Date().getTime().toString().slice(5) * 76543;
      const { nominal } = req.body;
      const booking = await createPayment(bookingId, nominal);
      res.send(booking);
    } catch (error) {
      res.status(400).send(error.message);
    }
  },
  paymentNotif: async (req, res) => {
    try {
      const { bookingId } = req.params;
      let apiClient = new midtransClient.Snap({
        isProduction: false,
        serverKey: "SB-Mid-server-juLsGW6j_AxrxRzJ2yS5CyMd",
        clientKey: "SB-Mid-client-Zr3pJ1_V8tr4Y6ds",
      });

      apiClient.transaction.notification(req.body).then((statusResponse) => {
        res.send(statusResponse);
        let orderId = statusResponse.order_id;
        let transactionStatus = statusResponse.transaction_status;
        let fraudStatus = statusResponse.fraud_status;

        console.log(
          `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`
        );

        // Sample transactionStatus handling logic

        if (transactionStatus == "capture") {
          // capture only applies to card transaction, which you need to check for the fraudStatus
          if (fraudStatus == "challenge") {
            // TODO set transaction status on your databaase to 'challenge'
          } else if (fraudStatus == "accept") {
            // TODO set transaction status on your databaase to 'success'
          }
        } else if (transactionStatus == "settlement") {
          // TODO set transaction status on your databaase to 'success'
        } else if (transactionStatus == "deny") {
          // TODO you can ignore 'deny', because most of the time it allows payment retries
          // and later can become success
        } else if (
          transactionStatus == "cancel" ||
          transactionStatus == "expire"
        ) {
          // TODO set transaction status on your databaase to 'failure'
        } else if (transactionStatus == "pending") {
          // TODO set transaction status on your databaase to 'pending' / waiting payment
        }
      });
    } catch (error) {}
  },
  updateOrder: async (req, res) => {
    try {
      const id = req.params.id;
      const data = {
        status: "payment",
      };
      const student = await firestore.collection("orders").doc(id);
      await student.update(data);
      res.send("Student telah membayar spp");
    } catch (error) {
      res.status(400).send(error.message);
    }
  },
};
