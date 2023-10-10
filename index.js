const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
require("dotenv").config();

app.use(bodyParser.json());
app.use(cors());

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to the database');
});

app.get('/', (req, res) => {
    res.send("Server is running")
});

app.post('/', (req, res) => {
    const {direction, zone, weight} = req.body;
    let final_rate = 0;
    let roundOfWeight = Math.ceil(weight * 2) / 2; // 0.5
    if (direction == "Forward" && zone == 'Domestic') {
        final_rate = roundOfWeight * 15;
    } else if (direction == "Forward" && zone == 'International') {
        final_rate = roundOfWeight * 2 * 27;
    } else if (direction == 'Reverse' && zone == 'Domestic') {
        final_rate = roundOfWeight * 2 * 20;
    } else if (direction == 'Reverse' && zone == 'International') {
        final_rate = roundOfWeight * 2 * 30;
    }

    const sql = 'INSERT INTO main (direction, zone, weight, final_rate) VALUES (?, ?, ?, ?)';
    const values = [direction, zone, weight, final_rate];

    connection.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error inserting data: ' + error.message);
            return res.status(500).json({error: 'Error inserting data'});
        }

        console.log('Data inserted into the table');
        res.status(200).json({message: 'Data inserted successfully'});
    });
});


app.listen(process.env.PORT, () => {
    console.log('Server is running on port '+process.env.PORT);
});
