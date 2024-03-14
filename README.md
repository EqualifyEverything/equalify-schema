# STREAM 
**Standardized Test Results for Equal Accessibility Measurement (STREAM)**

## Overview
The variability in accessibility testing results formats can lead to confusion and redundant effort. STREAM addresses this by standardizing these results into a format that's both human-readable and comprehensive, making it easier to identify and rectify accessibility issues.

## Our Goal
STREAM simplifies the accessibility testing landscape by:
1. **Preserving critical violation and success data** to aid in remediation efforts.
2. **Enhancing readability** to ensure results are easily understood at a glance.

Our initiative encourages testing providers to distinguish their unique offerings while establishing a common ground for evaluating various tools' outputs.

## Getting Started
### Running the STREAM App
The STREAM app transforms accessibility test outputs into the STREAM format, ensuring compliance with the defined [stream-schema.json](stream-schema.json).

**Prerequisites:**
- Node.js
- npm

**Steps:**
1. Clone this repository and navigate to the `stream-app` directory:
```
cd stream-app
```
2. Install dependencies:
```
npm install
```
3. Launch the server:
```
node server.js
```

### Using the API
The app's functionality is exposed through an API, enabling the reformatting of test results via HTTP requests.

**With `curl`:**
```
curl -X POST http://localhost:3000/api/reformat
-H "Content-Type: application/json"
-d '[Your JSON data here]'
```


**With Postman:**
1. Set the request type to `POST`.
2. Use the URL `http://localhost:3000/api/reformat`.
3. Input your JSON data in the request's "Body" section (set to raw).
4. Click 'Send'.

## Contributing
We invite contributions to refine the STREAM schema and enhance our conversion logic. If you've identified a bug or have a suggestion, please fork this repository, make your changes, and submit a pull request.

**Areas of Interest:**
- Bug fixes
- New conversion methodologies

## Support and Maintenance
STREAM is proudly maintained by [Equalify](http://github.com/equalifyEverything/), an org dedicated to creating community-driven Open Source accessible web tools. 

**Support Equalify:**
- Star our [GitHub repo](https://github.com/EqualifyEverything/equalify)
- Try our [hosted services](https://equalify.app)

**Interested in becoming a maintainer?** 
Submit a PR with your in this section to join the cause.