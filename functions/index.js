const functions = require("firebase-functions")
const admin = require("firebase-admin")

const express = require("express")
const app = express()

//DURING DEPLOYMENT
admin.initializeApp()

//DURING LOCAL TESTING
// const serviceAccountkey = require("../serviceAccount.json")
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccountkey),
//   databaseURL: "https://tolet-app-bd.firebaseio.com",
// })

app.get("/get-rentals/", (req, res) => {
  let userID = req.query.userID

  admin
    .firestore()
    .collection(`/users/${userID}/rentals`)
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let rentals = []

      data.forEach((doc) => {
        rentals.push({
          rentalID: doc.id,
          geolocation: doc.data().geolocation,
          rent: doc.data().rent,
          rooms: doc.data().rooms,
          title: doc.data().title,
          createdAt: doc.data().createdAt,
        })
      })

      return res.json(rentals)
    })
    .catch((err) => res.send(err))
})

app.post("/create-rental", (req, res) => {
  const newRental = {
    geolocation: req.body.geolocation,
    rent: req.body.rent,
    rooms: req.body.rooms,
    title: req.body.title,
    createdAt: new Date().toISOString(),
  }
  const userID = req.body.userID

  admin
    .firestore()
    .collection(`users/${userID}/rentals`)
    .add(newRental)
    .then((doc) => {
      res.send({ message: `document ${doc.id} created successfully` })
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong" })
      console.log(err)
    })
})

exports.api = functions.https.onRequest(app)
