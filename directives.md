<!-- REPLACE SAMPLE CODE AND RUN IN GPT -->

Keeping those page, tags, and rules functions, add a new function called "process_messages_from_scan" to handle new input data.  Inside of axe's "nodes" array, we use data from the objects in "any" and "all" arrays to populate our messages. the value of the "id" attribute in the object is used for a new "messageName" in Equalify. The "message" in the object is used for the "messageBody" in Equalify. The data present for the "impact" attribute in the object is added as a new tag in "tags". The new tag's tagTaxonomyId = 2 and the tagName is the value of "impact". No two tags should have the same content, so if you are adding a tag that already exists to an rule or message or element, reference the "tagId" that already exists instead of creating a new one.

This:
```
{
    "scan": "axe",
    "input": [
        {
            "result": {
                "results": {
                    "url": "https://make.wordpress.org/docs/",
                    "violations": [
                        {
                            "id": "button-name",
                            "description": "Ensures buttons have discernible text",
                            "help": "Buttons must have discernible text",
                            "helpUrl": "https://dequeuniversity.com/rules/axe/4.8/button-name?application=axe-puppeteer",        
                            "tags": [
                                "cat.name-role-value",
                                "wcag2aa",
                                "wcag412"
                            ]
                        },
                        {
                            "id": "color-contrast",
                            "description": "Ensures the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
                            "help": "Elements must meet minimum color contrast ratio thresholds",
                            "helpUrl": "https://dequeuniversity.com/rules/axe/4.8/color-contrast?application=axe-puppeteer",        
                            "tags": [
                                "wcag2aa"
                            ]        
                        }
    
                    ]
                },
                "jobID": "188462"
            }
        },
        {
            "result": {
                "results": {
                    "timestamp": "2024-02-27T19:52:17.495Z",
                    "url": "https://example.com"
                },
                "jobID": "188462"
            }
        }
    ]
}
```

Should become this:
```
{
    "taxonomies": [
        {
            "taxonomyId": 1,
            "taxonomyName": "Rule Tags"
        }
    ],        
    "tags": [
        {
            "tagId": 1,
            "tagName": "cat.name-role-value"
        },
        {
            "tagId": 2,
            "tagName": "wcag2aa"
        },
        {
            "tagId": 3,
            "tagName": "wcag412"
        }
    ],
    "rules": [
        {
            "ruleId": 1,
            "ruleName": "button-name",
            "ruleBody": "<p>Ensures buttons have discernible text</p><p>Buttons must have discernible text</p><p><a href=\"https://dequeuniversity.com/rules/axe/4.8/button-name?application=axe-puppeteer\">More Info</a>",
            "ruletags": [1,2,3]
        }, 
        {
            "ruleId": 2,
            "ruleName": "color-contrast",
            "ruleBody": "<p>,Ensures the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds</p><p>lements must meet minimum color contrast ratio thresholds</p><p><a href=\"https://dequeuniversity.com/rules/axe/4.8/color-contrast?application=axe-puppeteer\">More Info</a>",
            "ruletags": [2]
        }  
    ],
    "pages": [
      {
        "pageId": 1,
        "pageName": "https://make.wordpress.org/docs/"
      },
      {
        "pageId": 2,
        "pageName": "https://example.com"
      }
    ]
}
``` 