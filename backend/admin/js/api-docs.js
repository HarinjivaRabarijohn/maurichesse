// API Documentation JavaScript for Admin Dashboard
let swaggerUIInstance = null;

// Load Swagger UI with OpenAPI specification
async function loadSwaggerUI() {
    const container = document.getElementById('swagger-ui-container');
    let baseUrl = document.getElementById('apiBaseUrl').value;
    
    if (!container) {
        console.error('Swagger UI container not found');
        return;
    }
    
    // Handle relative vs absolute URLs
    if (!baseUrl.startsWith('http')) {
        // Convert relative path to absolute
        baseUrl = new URL(baseUrl, window.location.href).href;
    }
    
    try {
        // Show loading state
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #666;">
                <div style="font-size: 2rem; margin-bottom: 16px;">⏳</div>
                <p>Loading API documentation...</p>
                <p style="font-size: 0.9rem; margin-top: 8px;">Fetching from: ${baseUrl}</p>
            </div>
        `;
        
        // Fetch OpenAPI specification
        const response = await fetch(`${baseUrl}/openapi.php`);
        if (!response.ok) {
            throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
        }
        
        const openAPISpec = await response.json();
        
        // Initialize Swagger UI
        await initializeSwaggerUI(openAPISpec, baseUrl);
        
    } catch (error) {
        console.error('Error loading Swagger UI:', error);
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #e74c3c;">
                <div style="font-size: 2rem; margin-bottom: 16px;">❌</div>
                <p>Failed to load API documentation</p>
                <p style="font-size: 0.9rem; margin-top: 8px;">${error.message}</p>
                <div style="margin-top: 16px;">
                    <p style="font-size: 0.8rem;">Try these solutions:</p>
                    <ul style="text-align: left; display: inline-block; font-size: 0.8rem;">
                        <li>Check if the API server is running</li>
                        <li>Verify the API base URL is correct</li>
                        <li>Try using full URL: http://localhost/mauheritage/api</li>
                        <li>Check browser console for CORS errors</li>
                    </ul>
                </div>
                <button onclick="loadSwaggerUI()" style="margin-top: 16px; background: #e74c3c; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
    }
}

// Initialize Swagger UI with custom implementation
async function initializeSwaggerUI(openAPISpec, baseUrl) {
    const container = document.getElementById('swagger-ui-container');
    
    // Create custom Swagger UI interface
    container.innerHTML = `
        <div style="height: 100%; overflow-y: auto; background: #fff;">
            <style>
                .swagger-custom { font-family: Arial, sans-serif; }
                .swagger-header { background: #4a90e2; color: white; padding: 16px; position: sticky; top: 0; z-index: 100; }
                .swagger-header h2 { margin: 0; font-size: 1.5rem; }
                .swagger-info { background: #f8f9fa; padding: 16px; border-bottom: 1px solid #dee2e6; }
                .swagger-section { margin-bottom: 24px; }
                .swagger-section h3 { background: #e9ecef; padding: 12px 16px; margin: 0; cursor: pointer; border-bottom: 1px solid #dee2e6; }
                .swagger-section h3:hover { background: #dee2e6; }
                .swagger-endpoint { border-bottom: 1px solid #dee2e6; }
                .swagger-method { padding: 16px; }
                .swagger-method-get { border-left: 4px solid #61affe; }
                .swagger-method-post { border-left: 4px solid #49cc90; }
                .swagger-method-put { border-left: 4px solid #fca130; }
                .swagger-method-delete { border-left: 4px solid #f93e3e; }
                .swagger-path { font-family: monospace; font-weight: bold; color: #333; margin-bottom: 8px; }
                .swagger-description { color: #666; margin-bottom: 12px; }
                .swagger-params { margin-bottom: 12px; }
                .swagger-param { background: #f8f9fa; padding: 8px; margin-bottom: 4px; border-radius: 4px; }
                .swagger-param-name { font-weight: bold; color: #333; }
                .swagger-param-type { color: #666; font-size: 0.9rem; }
                .swagger-request { margin-bottom: 16px; }
                .swagger-request-body { background: #f8f9fa; padding: 12px; border-radius: 4px; margin-bottom: 12px; }
                .swagger-request-body textarea { width: 100%; height: 120px; font-family: monospace; font-size: 0.9rem; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
                .swagger-buttons { display: flex; gap: 8px; margin-top: 12px; }
                .swagger-btn { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
                .swagger-btn-try { background: #4a90e2; color: white; }
                .swagger-btn-try:hover { background: #357abd; }
                .swagger-btn-clear { background: #6c757d; color: white; }
                .swagger-btn-clear:hover { background: #545b62; }
                .swagger-response { margin-top: 16px; }
                .swagger-response-body { background: #f8f9fa; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 0.9rem; white-space: pre-wrap; max-height: 300px; overflow-y: auto; }
                .swagger-response-success { border-left: 4px solid #28a745; }
                .swagger-response-error { border-left: 4px solid #dc3545; }
                .swagger-loading { text-align: center; padding: 20px; color: #666; }
            </style>
            <div class="swagger-custom">
                <div class="swagger-header">
                    <h2>📘 MauHeritage API Documentation</h2>
                    <p style="margin: 4px 0 0 0; opacity: 0.9;">Interactive API testing interface</p>
                </div>
                <div class="swagger-info">
                    <h3>${openAPISpec.info.title}</h3>
                    <p>${openAPISpec.info.description}</p>
                    <p><strong>Version:</strong> ${openAPISpec.info.version}</p>
                    <p><strong>Base URL:</strong> ${baseUrl}</p>
                </div>
                <div id="swagger-endpoints"></div>
            </div>
        </div>
    `;
    
    // Render endpoints
    renderEndpoints(openAPISpec, baseUrl);
}

// Render API endpoints
function renderEndpoints(openAPISpec, baseUrl) {
    const endpointsContainer = document.getElementById('swagger-endpoints');
    if (!endpointsContainer) return;
    
    let html = '';
    
    // Group endpoints by tags
    const tags = openAPISpec.tags || [];
    const paths = openAPISpec.paths || {};
    
    // Group endpoints by tag
    const endpointsByTag = {};
    
    Object.keys(paths).forEach(path => {
        Object.keys(paths[path]).forEach(method => {
            const endpoint = paths[path][method];
            const endpointTags = endpoint.tags || ['Default'];
            
            endpointTags.forEach(tag => {
                if (!endpointsByTag[tag]) {
                    endpointsByTag[tag] = [];
                }
                endpointsByTag[tag].push({
                    path,
                    method: method.toUpperCase(),
                    endpoint
                });
            });
        });
    });
    
    // Render each tag section
    tags.forEach(tag => {
        const tagInfo = tag;
        const endpoints = endpointsByTag[tag.name] || [];
        
        if (endpoints.length > 0) {
            html += `
                <div class="swagger-section">
                    <h3 onclick="toggleSection('${tag.name}')">
                        📂 ${tagInfo.name}
                        <span style="float: right; font-size: 0.8rem;">${endpoints.length} endpoints</span>
                    </h3>
                    <div id="section-${tag.name}" style="display: none;">
                        ${endpoints.map(ep => renderEndpoint(ep, baseUrl)).join('')}
                    </div>
                </div>
            `;
        }
    });
    
    // Add untagged endpoints
    const untaggedEndpoints = endpointsByTag['Default'] || [];
    if (untaggedEndpoints.length > 0) {
        html += `
            <div class="swagger-section">
                <h3 onclick="toggleSection('default')">
                    📂 Other Endpoints
                    <span style="float: right; font-size: 0.8rem;">${untaggedEndpoints.length} endpoints</span>
                </h3>
                <div id="section-default" style="display: none;">
                    ${untaggedEndpoints.map(ep => renderEndpoint(ep, baseUrl)).join('')}
                </div>
            </div>
        `;
    }
    
    endpointsContainer.innerHTML = html;
}

// Render individual endpoint
function renderEndpoint(endpoint, baseUrl) {
    const { path, method, endpoint: ep } = endpoint;
    const methodLower = method.toLowerCase();
    const summary = ep.summary || ep.description || `${method} ${path}`;
    const parameters = ep.parameters || [];
    const requestBody = ep.requestBody;
    
    return `
        <div class="swagger-endpoint">
            <div class="swagger-method swagger-method-${methodLower}">
                <div class="swagger-path">${method} ${path}</div>
                <div class="swagger-description">${summary}</div>
                
                ${parameters.length > 0 ? `
                    <div class="swagger-params">
                        <strong>Parameters:</strong>
                        ${parameters.map(param => `
                            <div class="swagger-param">
                                <span class="swagger-param-name">${param.name}</span>
                                <span class="swagger-param-type">(${param.in}, ${param.schema?.type || 'string'})</span>
                                ${param.required ? ' <span style="color: #dc3545;">*</span>' : ''}
                                ${param.description ? `<br><small>${param.description}</small>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${requestBody ? `
                    <div class="swagger-request">
                        <strong>Request Body:</strong>
                        <div class="swagger-request-body">
                            <textarea id="request-${methodLower}-${path.replace(/[^a-zA-Z0-9]/g, '-')}" placeholder="Enter JSON request body here...">${JSON.stringify(getExampleSchema(requestBody.content), null, 2)}</textarea>
                        </div>
                    </div>
                ` : ''}
                
                <div class="swagger-buttons">
                    <button class="swagger-btn swagger-btn-try" onclick="tryAPI('${methodLower}', '${path}', '${baseUrl}')">
                        🚀 Try it out
                    </button>
                    <button class="swagger-btn swagger-btn-clear" onclick="clearResponse('${methodLower}-${path.replace(/[^a-zA-Z0-9]/g, '-')}')">
                        🗑️ Clear
                    </button>
                </div>
                
                <div id="response-${methodLower}-${path.replace(/[^a-zA-Z0-9]/g, '-')}" class="swagger-response"></div>
            </div>
        </div>
    `;
}

// Get example schema from request body
function getExampleSchema(content) {
    if (!content || !content['application/json']) return {};
    
    const schema = content['application/json'].schema;
    if (schema.example) return schema.example;
    if (schema.properties) {
        const example = {};
        Object.keys(schema.properties).forEach(key => {
            const prop = schema.properties[key];
            example[key] = prop.example || getDefaultValue(prop);
        });
        return example;
    }
    return {};
}

// Get default value for schema property
function getDefaultValue(property) {
    switch (property.type) {
        case 'string': return property.enum ? property.enum[0] : '';
        case 'number': case 'integer': return 0;
        case 'boolean': return false;
        case 'array': return [];
        case 'object': return {};
        default: return '';
    }
}

// Toggle section visibility
function toggleSection(sectionId) {
    const section = document.getElementById(`section-${sectionId}`);
    if (section) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
}

// Try API endpoint
async function tryAPI(method, path, baseUrl) {
    const responseContainer = document.getElementById(`response-${method}-${path.replace(/[^a-zA-Z0-9]/g, '-')}`);
    const requestContainer = document.getElementById(`request-${method}-${path.replace(/[^a-zA-Z0-9]/g, '-')}`);
    
    if (!responseContainer) return;
    
    // Show loading state
    responseContainer.innerHTML = '<div class="swagger-loading">⏳ Sending request...</div>';
    
    try {
        // Build request URL
        let url = `${baseUrl}${path}`;
        
        // Get request options
        const options = {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        
        // Add request body if available
        if (requestContainer && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
            try {
                const requestBody = JSON.parse(requestContainer.value);
                options.body = JSON.stringify(requestBody);
            } catch (e) {
                // If JSON parsing fails, send as-is
                options.body = requestContainer.value;
            }
        }
        
        // Send request
        const response = await fetch(url, options);
        const responseText = await response.text();
        
        // Try to parse as JSON
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            responseData = responseText;
        }
        
        // Display response
        const isSuccess = response.ok;
        responseContainer.innerHTML = `
            <div class="swagger-response-body ${isSuccess ? 'swagger-response-success' : 'swagger-response-error'}">
                <div style="margin-bottom: 8px;">
                    <strong>Response Status:</strong> 
                    <span style="color: ${isSuccess ? '#28a745' : '#dc3545'}">${response.status} ${response.statusText}</span>
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>Response Headers:</strong>
                    <pre style="font-size: 0.8rem; background: #f8f9fa; padding: 8px; border-radius: 4px; margin: 4px 0;">${JSON.stringify(Object.fromEntries(response.headers), null, 2)}</pre>
                </div>
                <div>
                    <strong>Response Body:</strong>
                    <pre>${JSON.stringify(responseData, null, 2)}</pre>
                </div>
            </div>
        `;
        
    } catch (error) {
        responseContainer.innerHTML = `
            <div class="swagger-response-body swagger-response-error">
                <strong>Error:</strong> ${error.message}
            </div>
        `;
    }
}

// Clear response
function clearResponse(endpointId) {
    const responseContainer = document.getElementById(`response-${endpointId}`);
    if (responseContainer) {
        responseContainer.innerHTML = '';
    }
}

// Refresh API documentation
function refreshAPIDocs() {
    loadSwaggerUI();
}

// Export OpenAPI specification
function exportOpenAPI() {
    const baseUrl = document.getElementById('apiBaseUrl').value;
    
    fetch(`${baseUrl}/openapi.php`)
        .then(response => response.json())
        .then(openAPISpec => {
            const blob = new Blob([JSON.stringify(openAPISpec, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mauheritage-api-openapi.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error exporting OpenAPI spec:', error);
            alert('Failed to export OpenAPI specification');
        });
}

// Initialize API docs when tab is opened
function openAPIDocsTab() {
    setTimeout(() => {
        loadSwaggerUI();
    }, 100);
}

// Add tab opening override
document.addEventListener('DOMContentLoaded', () => {
    const originalOpenTab = window.openTab;
    if (originalOpenTab) {
        window.openTab = function(evt, tabName) {
            originalOpenTab(evt, tabName);
            
            if (tabName === 'api-docs') {
                openAPIDocsTab();
            }
        };
    }
});
