const express = require('express');
const bodyParser = require('body-parser');
const convertAxeResultsToStream = require('./converters/axe-core');
const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Initialize AJV and load the STREAM schema
const ajv = new Ajv({ allErrors: true });
const streamSchema = JSON.parse(fs.readFileSync(path.join(__dirname, 'stream-schema.json'), 'utf-8'));

app.use(bodyParser.json());

app.post('/api/reformat', (req, res) => {
    const axeResults = req.body;
    // Convert axe-core results to STREAM format
    const streamData = convertAxeResultsToStream(axeResults);
    // Validate the converted data against the STREAM schema
    const validate = ajv.compile(streamSchema);
    const valid = validate(streamData);

    // Custom validation for unique nodes, tags, urls, and messages with types
    const uniqueNodes = new Set();
    const uniqueTags = new Set();
    const uniqueUrls = new Set();
    const uniqueMessages = new Set();

    // Use a combination of HTML and targets to identify unique nodes
    streamData.nodes.forEach(n => uniqueNodes.add(`${n.html}::${n.targets.join(',')}`));
    streamData.tags.forEach(t => uniqueTags.add(t.tag));
    streamData.urls.forEach(u => uniqueUrls.add(u.url));
    streamData.messages.forEach(m => uniqueMessages.add(`${m.message}::${m.type}`));

    // Check for duplicates in the sets
    const errors = [];
    if (uniqueNodes.size !== streamData.nodes.length) errors.push({ message: "Duplicate nodes detected." });
    if (uniqueTags.size !== streamData.tags.length) errors.push({ message: "Duplicate tags detected." });
    if (uniqueUrls.size !== streamData.urls.length) errors.push({ message: "Duplicate URLs detected." });
    if (uniqueMessages.size !== streamData.messages.length) errors.push({ message: "Duplicate messages with the same type detected." });

    if (!valid || errors.length > 0) {
        // If schema validation or custom validation fails, return an error response
        return res.status(400).json({
            message: "Validation error",
            errors: validate.errors ? validate.errors.concat(errors) : errors
        });
    }

    // If all validations pass, return the STREAM data
    res.json(streamData);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});