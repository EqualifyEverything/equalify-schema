<?php

// When transitioning axe-core to Equalify data:
// - The "id", "description", "help", and "helpUrl" field of an object within "violations" creates a the object within "rules". The "id" becomes the "ruleName". "description", "help", and "helpUrl" are put into paragraphs then added to "ruleBody". The "ruleId" is a unque ID for that rule. No two rules should have the same "ruleName" and "ruleBody", so if you are adding a rule that already exists to an element, reference the "ruleId" that already exists instead of creating a new one.
// - The "tags" field of an object within "vilolations" are each added to the Equalify "tags" array. "tagId" is a unique ID, "tagTaxonomyId" is 1, "tagName" is the the tag. No two rules should have the same data. No two tags should have the same content, so if you are adding a tag that already exists to an rule or message or element, reference the "tagId" that already exists instead of creating a new one.
// - Inside of axe's "nodes" array, we use data from the objects in "any" and "all" arrays to populate our messages. the value of the "id" attribute in the object is used for a new "messageName" in Equalify. The "message" in the object is used for the "messageBody" in Equalify. The data present for the "impact" attribute in the object is added as a new tag in "tags". The new tag's tagTaxonomyId = 2 and the tagName is the value of "impact". No two tags should have the same content, so if you are adding a tag that already exists to an rule or message or element, reference the "tagId" that already exists instead of creating a new one.
// - Content within Axe-core's "relatedNodes" array creates an element. The "html" attribute of a relatedNode becomes  an "element" in the Equalify with the "elementCode" being the "html". We also add the "messageId" of the message in the parent object of "relatedNodes" to "elementMessages". No two elements should have the same "elementCode" data, so do not add an element that already exists.
// - Within a node object is also an "html" attribute. The "html" attribute becomes is an "element" in the Equalify  with the "elementCode" being the "html". That element is also related to any messages in the node, with "elementMessages", to any rules in the violation with "emementRules", and to any pages with "elementPages". An element's "relatedElements" are the ids of any elemenets we created from "relatedNodes" in axe. No two elements should have the same "elementCode" data, so do not add an element that already exists.

// Anything not discusses should be removed.


function process_pages_from_scan($input) {
    $output = ['pages' => []];
    $pageId = 1;

    foreach ($input['input'] as $item) {
        $url = $item['result']['results']['url'];

        $exists = false;
        foreach ($output['pages'] as $page) {
            if ($page['pageName'] === $url) {
                $exists = true;
                break;
            }
        }

        if (!$exists) {
            $output['pages'][] = [
                'pageId' => $pageId++,
                'pageName' => $url
            ];
        }
    }

    return $output;
}

function process_tags_from_scan($input) {
    $output = ['tags' => [], 'taxonomies' => [['taxonomyId' => 1, 'taxonomyName' => 'Rule Tags']]];
    $tagId = 1;
    $tagNames = [];

    foreach ($input['input'] as $item) {
        if (isset($item['result']['results']['violations'])) {
            foreach ($item['result']['results']['violations'] as $violation) {
                foreach ($violation['tags'] as $tagName) {
                    if (!array_key_exists($tagName, $tagNames)) {
                        $tagNames[$tagName] = $tagId;
                        $output['tags'][] = [
                            'tagId' => $tagId++,
                            'tagName' => $tagName,
                            'tagTaxonomyId' => 1
                        ];
                    }
                }
            }
        }
    }

    return ['output' => $output, 'tagNames' => $tagNames];
}

function process_rules_from_scan($input, $tagNames) {
    $output = ['rules' => []];
    $ruleId = 1;
    $ruleNames = [];

    foreach ($input['input'] as $item) {
        if (isset($item['result']['results']['violations'])) {
            foreach ($item['result']['results']['violations'] as $violation) {
                $ruleName = $violation['id'];
                $description = $violation['description'];
                $help = $violation['help'];
                $helpUrl = $violation['helpUrl'];
                $ruleBody = "<p>$description</p><p>$help</p><p><a href=\"$helpUrl\">More Info</a></p>";

                // Check if this rule is already added to prevent duplicates
                $exists = false;
                foreach ($output['rules'] as $rule) {
                    if ($rule['ruleName'] === $ruleName && $rule['ruleBody'] === $ruleBody) {
                        $exists = true;
                        break;
                    }
                }

                if (!$exists) {
                    $ruleTags = [];
                    foreach ($violation['tags'] as $tagName) {
                        if (array_key_exists($tagName, $tagNames)) {
                            $ruleTags[] = $tagNames[$tagName];
                        }
                    }

                    $output['rules'][] = [
                        'ruleId' => $ruleId++,
                        'ruleName' => $ruleName,
                        'ruleBody' => $ruleBody,
                        'ruleTags' => $ruleTags
                    ];
                }
            }
        }
    }

    return $output;
}

function process_scan($input) {
    $pagesOutput = process_pages_from_scan($input);
    $tagsResult = process_tags_from_scan($input);
    $tagsOutput = $tagsResult['output'];
    $tagNames = $tagsResult['tagNames'];
    $rulesOutput = process_rules_from_scan($input, $tagNames);

    // Merge the outputs
    $output = array_merge_recursive($pagesOutput, $tagsOutput, $rulesOutput);

    return $output;
}

// Assuming the JSON input is POSTed as raw body content
$inputJSON = file_get_contents('input.json');
$input = json_decode($inputJSON, true); // Decode as an array

// Process the scan and get the output
$output = process_scan($input);

header('Content-Type: application/json; charset=utf-8');

// Encode the output array to JSON and print it
echo json_encode($output, JSON_PRETTY_PRINT);
?>
