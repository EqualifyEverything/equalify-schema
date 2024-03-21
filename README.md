# STREAM 
**Standardized Test Results for Equal Accessibility Measurement (STREAM)**

## Problem
Equalify reformats lots of accessibility test results. We are tired of it! We would rather spend time building solutions from various scans that output results in a unified format that's easy to understand. (We tried to understand [EARL](https://www.w3.org/WAI/standards-guidelines/earl/), but it's quite complicated and hasn't been updated since 2017.)

## Our Solution
STREAM standardizes accessibility test results into a format that's both human-readable and comprehensive, making it easier to identify and rectify accessibility issues.

STREAM simplifies the accessibility testing landscape by:
1. **Preserving critical violation and success data** to aid in remediation efforts.
2. **Enhancing readability** to ensure results are easily understood at a glance.

Equalify and participating devs are developing [stream-schema.json](https://github.com/EqualifyEverything/STREAM/blob/main/stream-app/stream-schema.json) to standardize how results are reported.

## Key Benefits
- **Reduced File Size**: STREAM reformats complex data into a simple structure that reduces redundancy.
- **Faster Processing**: Smaller file sizes with a simple structure mean reduced processing time.
- **Reduced Redundancy**: All content in a STREAM file is unique, so you see fewer redundant items like messages and tags.

## Getting Started
### Running the STREAM App
The STREAM app transforms accessibility test outputs into the STREAM format, ensuring compliance with [stream-schema.json](https://github.com/EqualifyEverything/STREAM/blob/main/stream-app/stream-schema.json).

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
STREAM is a standard created by hacking.

Anyone who wants to update STREAM can. If you've identified a bug or have a suggestion, please fork this repository, make your changes, and submit a pull request.

## Why aren't we working with WAI?
The Web Accessibility Initiative (WAI) is an awesome organization building accessibility policy through consensus. 

Unfortunately, Equalify can't afford to participate in the policy-building processes that WAI encourages. Equalify is a small organization trying to do big things. 

STREAM is built to address the immediate needs of Equalify and contributors who want to join the development. As we find technical challenges, we update the standard. Maybe at CSUN 2025, we'll present a paper showing the problems and solutions that STREAM addresses. We welcome anyone with the bandwidth to work with WAI to take our project into something like a new version of [EARL](https://www.w3.org/WAI/standards-guidelines/earl/).

**Areas of Interest:**
- Bug fixes
- New conversion methodologies

## Support and Maintenance
STREAM is  maintained by [Equalify](http://github.com/equalifyEverything/), a community-driven initiative to build Open Source web accessibility tools. 

**Support Equalify:**
- Star our [GitHub repo](https://github.com/EqualifyEverything/equalify)
- Try our [hosted services](https://equalify.app)

**Interested in becoming a maintainer?** 
Submit a PR with your in this section to join the cause.
