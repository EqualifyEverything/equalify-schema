# STREAM 
**Standardized Test Results for Equal Accessibility Measurement (STREAM)**

## Problem
Accessibility test results are formatted in lots of different ways. That means we have to reformat the results into a standard format that has to be constantly updated when scans change. That work costs valuable time as we try to build new tools that integrate with scans. Existing standardized schemas, including [EARL](https://www.w3.org/WAI/standards-guidelines/earl/), are hard to understand and not widely adopted.

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

**Areas of Interest:**
- Bug fixes
- Support for new scans

## Why aren't we working with WAI?
The Web Accessibility Initiative (WAI) is an awesome organization building accessibility policy. 

Unfortunately, Equalify can't afford to participate in the policy-building processes that WAI encourages. Equalify is a small organization trying to do big things, and we only have so much time!

STREAM is built to address the immediate needs of Equalify and contributors who want to join the development. As we find technical challenges, we update STREAM. Maybe at CSUN 2025, we'll present a paper showing the problems and solutions that STREAM addresses. We welcome anyone working with WAI to take our project into something like a new version of [EARL](https://www.w3.org/WAI/standards-guidelines/earl/).

## Maintainers
STREAM is maintained by [Equalify](http://github.com/equalifyEverything/). Anyone else is welcome to contribute.

**Interested in becoming a maintainer?** 
Submit a PR with your name in this section to join the cause.

## Support Equalify
Equalify is a community-driven initiative to build Open Source web accessibility tools. 

Three easy ways to support us:
- Star our [GitHub repo](https://github.com/EqualifyEverything/equalify).
- Try our [hosted services](https://equalify.app).
- Contribute to [our projects](https://github.com/orgs/EqualifyEverything/repositories).
