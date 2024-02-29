# Equalify Formatter
Standardize Results from Automated Testing Providers

## Problem
Automated tests give results in lots of different formats. This requires solutions, like [Testaro](https://github.com/cvs-health/testaro) and [Equalify](https://github.com/equalifyEverything/equalify), to do a lot of work in reformatting before they carry out a task.

## Solution
The Equalify Formatter is a web service to format the results of any automated accessibility scan. We take in results from a scan, then output formatted results. In doing so we aim to accomplish three goals:
1) Retain all information that's useful to fix reported violations.
2) Support all automated web accessibility scans.
3) Deliver results efficiently.

## Sample Input
```json
{
  "scan": "axe",
  "results": []
}
```
### Input Attributes
- `scan`: Unique ID of a [supported scan](#supported-scans).
- "results": JSON results of that scan.

## Sample Output
```json
{
  "messages": [
    {
      "name": "axe-unique_identifier",
      "description": "Description of the message",
      "suggestion": "Suggestion for resolving the message",
      "detailsUrl": "URL to more information",
      "pages": [
          {
             "url": "url"
          }
       ],
      "tags": [
          {
             "name": "unique_identifier"
          }
       ],
      "elements": [
        {
          "selector": "CSS selector of the element",
          "html": "Outer HTML of the affected element"
        }
      ],
      "relatedElements": [
        {
          "selector": "CSS selector of related element",
          "html": "Outer HTML of related element"
        }
      ]
    }
  ]
}
```
### Output Attributes
- **name**: A unique identifier for the rule or guideline that the message pertains to. This may be a rule ID from axe-core, a guideline reference from WAVE, or similar identifiers from other tools. All names will include 
- **description**: A brief explanation of the issue, guideline, or best practice identified by the message.
- **suggestion**: Recommended actions or considerations for addressing the issue described in the message.
- **detailsUrl**: A direct link to more detailed information, guidelines, or remediation advice related to the message.
- **pages**: An array of pages related to the message. Many scans would output one-page url, but this should also support scans that output multiple pages.
- **tags**: An array of tags categorizing the message. Tags will include the name of the tool that generated the message (e.g., "axe-core", "WAVE") and can include the impact level of the issue (e.g., "critical"), relevant WCAG criteria (e.g., "WCAG2A"), and the nature of the message (e.g., "Error", "Best Practice").
- **element**: Information about the primary HTML element associated with the message, including a CSS selector for identification and the element's outer HTML for context.
- **relatedElements**: An array of objects representing additional HTML elements related to the message. Each object includes a CSS selector and the outer HTML of the related element.

## Supported Scans
The following scans will be supported:
- [axe-core](https://github.com/dequelabs/axe-core) - Version 4.8.4. Scan ID: "axe".
- [WAVE](https://wave.webaim.org) - as of Feb. 29, 2024. Scan ID: "wave".

## Supporting a New Scan
We hope to add other scans! 

Documentation and code in this repo should provide the basis for including any scan.

Please create a pull request with any additional scan you want.
