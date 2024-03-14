const express = require('express');
const bodyParser = require('body-parser');
const convertAxeResultsToStream = require('./converters/axe-core');
const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Initialize AJV and load the STREAM schema
const ajv = new Ajv();
const streamSchema = JSON.parse(fs.readFileSync(path.join(__dirname, 'stream-schema.json'), 'utf-8'));

app.use(bodyParser.json());

app.post('/api/reformat', (req, res) => {
    const axeResults = req.body;

    // Convert axe-core results to STREAM format
    const streamData = convertAxeResultsToStream(axeResults);

    // Validate the converted data against the STREAM schema
    const validate = ajv.compile(streamSchema);
    const valid = validate(streamData);

    if (!valid) {
        // If validation fails, return an error response
        return res.status(400).json({
            message: "Validation error",
            errors: validate.errors
        });
    }

    // If validation passes, return the STREAM data
    res.json(streamData);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
