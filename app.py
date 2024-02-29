from flask import Flask, request, jsonify

app = Flask(__name__)

def process_axe_core_results(scan_results):
    processed_results = []
    
    for result in scan_results:
        # Each result may contain multiple violations/issues
        for violation in result['violations']:
            message = {
                'name': violation['id'],  # Unique identifier for the rule or guideline
                'description': violation['description'],
                'suggestion': violation.get('help', 'No suggestion available'),
                'detailsUrl': violation['helpUrl'],
                'pages': [{'url': page['url']} for page in result['urls']],  # Assuming 'urls' contains affected pages
                'tags': [{'name': tag} for tag in violation['tags']],
                'elements': [
                    {'selector': node['target'][0], 'html': node['html']} for node in violation['nodes']
                ],
                'relatedElements': []  # This would need to be filled based on specific related elements, if available
            }
            processed_results.append(message)
    
    return processed_results

def process_wave_results(scan_results):
    processed_results = []
    
    # Assuming scan_results contain categories like 'errors', 'alerts', etc.
    # Loop through each category (if WAVE results are categorized)
    for category in ['errors', 'alerts', 'features']:  # Adjust categories as needed
        for item in scan_results.get(category, []):
            message = {
                'name': item.get('id', f'wave_{category}_unknown'),  # Construct a unique identifier
                'description': item.get('description', 'No description available'),
                'suggestion': 'Refer to WAVE guidelines',  # WAVE might not provide direct suggestions
                'detailsUrl': item.get('detailsUrl', 'https://wave.webaim.org'),
                'pages': [{'url': 'Affected page URL'}],  # You might need to adjust how page URLs are provided
                'tags': [{'name': category}],  # Use category as a tag, enhance as needed
                'elements': [
                    {'selector': element.get('selector', 'Unknown'), 'html': element.get('html', 'Not provided')}
                    for element in item.get('elements', [])  # Assuming each item includes affected elements
                ],
                'relatedElements': []  # Fill based on item details if available
            }
            processed_results.append(message)
    
    return processed_results

@app.route('/process_scan', methods=['POST'])
def process_scan():
    data = request.json
    scan_id = data.get('scanId')
    scan_results = data.get('results')
    scan_type = data.get('scanType', '').lower()

    if scan_type == 'axe-core':
        processed_results = process_axe_core_results(scan_results)
    elif scan_type == 'wave':
        processed_results = process_wave_results(scan_results)
    else:
        return jsonify({'error': 'Unsupported scan type'}), 400

    return jsonify({
        'scanId': scan_id,
        'processedResults': processed_results
    })

if __name__ == '__main__':
    app.run(debug=True)
