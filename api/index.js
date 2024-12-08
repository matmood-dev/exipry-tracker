const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('MongoDB connected...');

        const serviceSchema = new mongoose.Schema({
            serviceName: String,
            date: String,
            price: Number
        });

        const Service = mongoose.model('Service', serviceSchema);

        // Insert mock data if the collection is empty
        const serviceCount = await Service.countDocuments();
        if (serviceCount === 0) {
            const mockServices = [
                { serviceName: 'Service 1', date: '01-01-2024', price: 100 },
                { serviceName: 'Service 2', date: '01-06-2024', price: 200 },
                { serviceName: 'Service 3', date: '01-11-2024', price: 300 },
                { serviceName: 'Service 4', date: '01-03-2025', price: 400 },
                { serviceName: 'Service 5', date: '01-09-2025', price: 500 },
                { serviceName: 'Service 6', date: '01-12-2025', price: 600 }
            ];

            await Service.insertMany(mockServices);
            console.log('Data inserted');
        }

        app.get('/services', async (req, res) => {
            const services = await Service.find();
            res.json(services);
        });

        app.post('/services', async (req, res) => {
            const newService = new Service(req.body);
            await newService.save();
            res.status(201).json(newService);
        });

        app.put('/services/:id', async (req, res) => {
            const { id } = req.params;
            const updatedService = await Service.findByIdAndUpdate(id, req.body, { new: true });
            res.json(updatedService);
        });

        app.delete('/services/:id', async (req, res) => {
            const { id } = req.params;
            await Service.findByIdAndDelete(id);
            res.status(204).send();
        });

        module.exports = app; // Export the app for serverless function
    })
    .catch(err => console.log(err));
