const express = require('express');
const bodyParser = require('body-parser');
const convertAxeResultsToEqualifySchema = require('./converters/axe-core');
const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Initialize AJV and load the Equalify Schema schema
const ajv = new Ajv({ allErrors: true });
const equalifySchema = JSON.parse(fs.readFileSync(path.join(__dirname, 'equalify-schema.json'), 'utf-8'));

app.use(bodyParser.json());

app.post('/api/reformat', (req, res) => {
    const axeResults = req.body;
    // Convert axe-core results to Equalify Schema format
    const equalifyData = convertAxeResultsToEqualifySchema(axeResults);
    // Validate the converted data against the Equalify Schema schema
    const validate = ajv.compile(equalifySchema);
    const valid = validate(equalifyData);

    // Custom validation for unique nodes, tags, urls, and messages with types
    const uniqueNodes = new Set();
    const uniqueTags = new Set();
    const uniqueMessages = new Set();

    // Use a combination of HTML and targets to identify unique nodes
    equalifyData.nodes.forEach(n => uniqueNodes.add(`${n.html}::${n.targets.join(',')}`));
    equalifyData.tags.forEach(t => uniqueTags.add(t.tag));
    equalifyData.messages.forEach(m => uniqueMessages.add(`${m.message}::${m.type}`));

    // Check for duplicates in the sets
    const errors = [];
    if (uniqueNodes.size !== equalifyData.nodes.length) errors.push({ message: "Duplicate nodes detected." });
    if (uniqueTags.size !== equalifyData.tags.length) errors.push({ message: "Duplicate tags detected." });
    if (uniqueMessages.size !== equalifyData.messages.length) errors.push({ message: "Duplicate messages with the same type detected." });

    if (!valid || errors.length > 0) {
        // If schema validation or custom validation fails, return an error response
        return res.status(400).json({
            message: "Validation error",
            errors: validate.errors ? validate.errors.concat(errors) : errors
        });
    }

    // If all validations pass, return the Equalify Schema data
    res.json(equalifyData);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});