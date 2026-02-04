<?php
/**
 * MauHeritage API Documentation Generator
 * Generates OpenAPI 3.0 specification for Swagger UI
 */

header('Content-Type: application/json');

// Base configuration
$baseUrl = 'http://localhost/mauheritage/api';
$openApi = [
    'openapi' => '3.0.0',
    'info' => [
        'title' => 'MauHeritage API',
        'description' => 'Complete API documentation for MauHeritage - Mauritius Heritage Explorer Application',
        'version' => '1.0.0',
        'contact' => [
            'name' => 'MauHeritage Admin',
            'email' => 'admin@mauheritage.mu'
        ]
    ],
    'servers' => [
        [
            'url' => $baseUrl,
            'description' => 'Development Server'
        ]
    ],
    'paths' => [],
    'components' => [
        'schemas' => [],
        'securitySchemes' => [
            'ApiKeyAuth' => [
                'type' => 'apiKey',
                'in' => 'header',
                'name' => 'Authorization',
                'description' => 'Session-based authentication'
            ]
        ]
    ]
];

// Define common schemas
$schemas = [
    'User' => [
        'type' => 'object',
        'properties' => [
            'user_id' => ['type' => 'integer', 'example' => 1],
            'username' => ['type' => 'string', 'example' => 'john_doe'],
            'email' => ['type' => 'string', 'format' => 'email', 'example' => 'john@example.com'],
            'created_at' => ['type' => 'string', 'format' => 'date-time', 'example' => '2024-01-01T12:00:00Z']
        ]
    ],
    'Admin' => [
        'type' => 'object',
        'properties' => [
            'admin_id' => ['type' => 'integer', 'example' => 1],
            'username' => ['type' => 'string', 'example' => 'admin'],
            'email' => ['type' => 'string', 'format' => 'email', 'example' => 'admin@mauheritage.mu'],
            'created_at' => ['type' => 'string', 'format' => 'date-time', 'example' => '2024-01-01T12:00:00Z']
        ]
    ],
    'Category' => [
        'type' => 'object',
        'properties' => [
            'category_id' => ['type' => 'integer', 'example' => 1],
            'category_name' => ['type' => 'string', 'example' => 'Historical Sites']
        ]
    ],
    'Location' => [
        'type' => 'object',
        'properties' => [
            'location_id' => ['type' => 'integer', 'example' => 1],
            'name' => ['type' => 'string', 'example' => 'Port Louis Market'],
            'description' => ['type' => 'string', 'example' => 'Historic market in the capital'],
            'latitude' => ['type' => 'number', 'format' => 'float', 'example' => -20.1667],
            'longitude' => ['type' => 'number', 'format' => 'float', 'example' => 57.5],
            'category_id' => ['type' => 'integer', 'example' => 1],
            'image' => ['type' => 'string', 'example' => 'uploads/locations/market.jpg']
        ]
    ],
    'QR' => [
        'type' => 'object',
        'properties' => [
            'qr_id' => ['type' => 'integer', 'example' => 1],
            'qr_code' => ['type' => 'string', 'example' => 'MAU001'],
            'location_id' => ['type' => 'integer', 'example' => 1]
        ]
    ],
    'FunFact' => [
        'type' => 'object',
        'properties' => [
            'fun_fact_id' => ['type' => 'integer', 'example' => 1],
            'qr_id' => ['type' => 'integer', 'example' => 1],
            'fact_text' => ['type' => 'string', 'example' => 'This market was built in 1840'],
            'hint_text' => ['type' => 'string', 'example' => 'Look for the oldest building'],
            'hint_2' => ['type' => 'string', 'example' => 'Check the foundation date'],
            'hint_3' => ['type' => 'string', 'example' => 'British colonial architecture']
        ]
    ],
    'Trail' => [
        'type' => 'object',
        'properties' => [
            'trail_id' => ['type' => 'integer', 'example' => 1],
            'trail_name' => ['type' => 'string', 'example' => 'Historic Port Louis Walk'],
            'description' => ['type' => 'string', 'example' => 'A walking tour through historic sites'],
            'start_lat' => ['type' => 'number', 'format' => 'float', 'example' => -20.1667],
            'start_lng' => ['type' => 'number', 'format' => 'float', 'example' => 57.5],
            'end_lat' => ['type' => 'number', 'format' => 'float', 'example' => -20.1500],
            'end_lng' => ['type' => 'number', 'format' => 'float', 'example' => 57.55]
        ]
    ],
    'Badge' => [
        'type' => 'object',
        'properties' => [
            'badge_id' => ['type' => 'integer', 'example' => 1],
            'name' => ['type' => 'string', 'example' => 'Explorer'],
            'description' => ['type' => 'string', 'example' => 'Visit 5 locations'],
            'criteria_type' => ['type' => 'string', 'example' => 'bronze'],
            'image_path' => ['type' => 'string', 'example' => 'uploads/badges/explorer.png']
        ]
    ],
    'Gallery' => [
        'type' => 'object',
        'properties' => [
            'gallery_id' => ['type' => 'integer', 'example' => 1],
            'location_id' => ['type' => 'integer', 'example' => 1],
            'image_path' => ['type' => 'string', 'example' => 'uploads/gallery/market1.jpg'],
            'caption' => ['type' => 'string', 'example' => 'Main entrance of the market']
        ]
    ],
    'Visit' => [
        'type' => 'object',
        'properties' => [
            'visit_id' => ['type' => 'integer', 'example' => 1],
            'user_id' => ['type' => 'integer', 'example' => 1],
            'location_id' => ['type' => 'integer', 'example' => 1],
            'visited_at' => ['type' => 'string', 'format' => 'date-time', 'example' => '2024-01-01T12:00:00Z']
        ]
    ],
    'Leaderboard' => [
        'type' => 'object',
        'properties' => [
            'user_id' => ['type' => 'integer', 'example' => 1],
            'username' => ['type' => 'string', 'example' => 'john_doe'],
            'score' => ['type' => 'integer', 'example' => 150],
            'visits' => ['type' => 'integer', 'example' => 10],
            'badges' => ['type' => 'integer', 'example' => 3]
        ]
    ],
    'Error' => [
        'type' => 'object',
        'properties' => [
            'success' => ['type' => 'boolean', 'example' => false],
            'message' => ['type' => 'string', 'example' => 'Invalid credentials']
        ]
    ],
    'Success' => [
        'type' => 'object',
        'properties' => [
            'success' => ['type' => 'boolean', 'example' => true],
            'message' => ['type' => 'string', 'example' => 'Operation completed successfully']
        ]
    ]
];

// Add schemas to components
$openApi['components']['schemas'] = $schemas;

// Define API endpoints
$paths = [
    // Authentication endpoints
    '/user_login.php' => [
        'post' => [
            'summary' => 'User Login',
            'description' => 'Authenticate user and create session',
            'tags' => ['Authentication'],
            'requestBody' => [
                'required' => true,
                'content' => [
                    'application/json' => [
                        'schema' => [
                            'type' => 'object',
                            'properties' => [
                                'username' => ['type' => 'string'],
                                'password' => ['type' => 'string']
                            ],
                            'required' => ['username', 'password']
                        ]
                    ]
                ]
            ],
            'responses' => [
                200 => [
                    'description' => 'Login successful',
                    'content' => [
                        'application/json' => [
                            'schema' => [
                                'type' => 'object',
                                'properties' => [
                                    'success' => ['type' => 'boolean'],
                                    'user' => ['$ref' => '#/components/schemas/User']
                                ]
                            ]
                        ]
                    ]
                ],
                401 => [
                    'description' => 'Invalid credentials',
                    'content' => [
                        'application/json' => [
                            'schema' => ['$ref' => '#/components/schemas/Error']
                        ]
                    ]
                ]
            ]
        ]
    ],
    
    '/admin_login.php' => [
        'post' => [
            'summary' => 'Admin Login',
            'description' => 'Authenticate admin user',
            'tags' => ['Authentication'],
            'requestBody' => [
                'required' => true,
                'content' => [
                    'application/json' => [
                        'schema' => [
                            'type' => 'object',
                            'properties' => [
                                'username' => ['type' => 'string'],
                                'password' => ['type' => 'string']
                            ],
                            'required' => ['username', 'password']
                        ]
                    ]
                ]
            ],
            'responses' => [
                200 => [
                    'description' => 'Login successful',
                    'content' => [
                        'application/json' => [
                            'schema' => [
                                'type' => 'object',
                                'properties' => [
                                    'success' => ['type' => 'boolean'],
                                    'admin' => ['$ref' => '#/components/schemas/Admin']
                                ]
                            ]
                        ]
                    ]
                ],
                401 => [
                    'description' => 'Invalid credentials',
                    'content' => [
                        'application/json' => [
                            'schema' => ['$ref' => '#/components/schemas/Error']
                        ]
                    ]
                ]
            ]
        ]
    ],

    // User endpoints
    '/user.php' => [
        'get' => [
            'summary' => 'Get Users',
            'description' => 'Retrieve list of all users',
            'tags' => ['Users'],
            'parameters' => [
                [
                    'name' => 'action',
                    'in' => 'query',
                    'required' => true,
                    'schema' => [
                        'type' => 'string',
                        'enum' => ['list']
                    ]
                ]
            ],
            'responses' => [
                200 => [
                    'description' => 'List of users',
                    'content' => [
                        'application/json' => [
                            'schema' => [
                                'type' => 'array',
                                'items' => ['$ref' => '#/components/schemas/User']
                            ]
                        ]
                    ]
                ]
            ]
        ],
        'post' => [
            'summary' => 'Create User',
            'description' => 'Create a new user account',
            'tags' => ['Users'],
            'parameters' => [
                [
                    'name' => 'action',
                    'in' => 'query',
                    'required' => true,
                    'schema' => [
                        'type' => 'string',
                        'enum' => ['add', 'update', 'delete']
                    ]
                ]
            ],
            'requestBody' => [
                'required' => true,
                'content' => [
                    'application/json' => [
                        'schema' => [
                            'type' => 'object',
                            'properties' => [
                                'username' => ['type' => 'string'],
                                'email' => ['type' => 'string', 'format' => 'email'],
                                'password' => ['type' => 'string'],
                                'user_id' => ['type' => 'integer']
                            ]
                        ]
                    ]
                ]
            ],
            'responses' => [
                200 => [
                    'description' => 'User created/updated/deleted',
                    'content' => [
                        'application/json' => [
                            'schema' => ['$ref' => '#/components/schemas/Success']
                        ]
                    ]
                ]
            ]
        ]
    ],

    // Category endpoints
    '/category.php' => [
        'get' => [
            'summary' => 'Get Categories',
            'description' => 'Retrieve list of all categories',
            'tags' => ['Categories'],
            'parameters' => [
                [
                    'name' => 'action',
                    'in' => 'query',
                    'required' => true,
                    'schema' => [
                        'type' => 'string',
                        'enum' => ['list']
                    ]
                ]
            ],
            'responses' => [
                200 => [
                    'description' => 'List of categories',
                    'content' => [
                        'application/json' => [
                            'schema' => [
                                'type' => 'array',
                                'items' => ['$ref' => '#/components/schemas/Category']
                            ]
                        ]
                    ]
                ]
            ]
        ],
        'post' => [
            'summary' => 'Manage Categories',
            'description' => 'Create, update, or delete categories',
            'tags' => ['Categories'],
            'parameters' => [
                [
                    'name' => 'action',
                    'in' => 'query',
                    'required' => true,
                    'schema' => [
                        'type' => 'string',
                        'enum' => ['add', 'update', 'delete']
                    ]
                ]
            ],
            'requestBody' => [
                'required' => true,
                'content' => [
                    'application/json' => [
                        'schema' => [
                            'type' => 'object',
                            'properties' => [
                                'category_id' => ['type' => 'integer'],
                                'category_name' => ['type' => 'string']
                            ]
                        ]
                    ]
                ]
            ],
            'responses' => [
                200 => [
                    'description' => 'Category operation successful',
                    'content' => [
                        'application/json' => [
                            'schema' => ['$ref' => '#/components/schemas/Success']
                        ]
                    ]
                ]
            ]
        ]
    ],

    // Location endpoints
    '/location.php' => [
        'get' => [
            'summary' => 'Get Locations',
            'description' => 'Retrieve list of all locations',
            'tags' => ['Locations'],
            'parameters' => [
                [
                    'name' => 'action',
                    'in' => 'query',
                    'required' => true,
                    'schema' => [
                        'type' => 'string',
                        'enum' => ['list']
                    ]
                ]
            ],
            'responses' => [
                200 => [
                    'description' => 'List of locations',
                    'content' => [
                        'application/json' => [
                            'schema' => [
                                'type' => 'array',
                                'items' => ['$ref' => '#/components/schemas/Location']
                            ]
                        ]
                    ]
                ]
            ]
        ],
        'post' => [
            'summary' => 'Manage Locations',
            'description' => 'Create, update, or delete locations',
            'tags' => ['Locations'],
            'parameters' => [
                [
                    'name' => 'action',
                    'in' => 'query',
                    'required' => true,
                    'schema' => [
                        'type' => 'string',
                        'enum' => ['add', 'update', 'delete']
                    ]
                ]
            ],
            'requestBody' => [
                'required' => true,
                'content' => [
                    'application/json' => [
                        'schema' => [
                            'type' => 'object',
                            'properties' => [
                                'location_id' => ['type' => 'integer'],
                                'name' => ['type' => 'string'],
                                'description' => ['type' => 'string'],
                                'latitude' => ['type' => 'number'],
                                'longitude' => ['type' => 'number'],
                                'category_id' => ['type' => 'integer'],
                                'image' => ['type' => 'string']
                            ]
                        ]
                    ]
                ]
            ],
            'responses' => [
                200 => [
                    'description' => 'Location operation successful',
                    'content' => [
                        'application/json' => [
                            'schema' => ['$ref' => '#/components/schemas/Success']
                        ]
                    ]
                ]
            ]
        ]
    ],

    // QR Code endpoints
    '/qr.php' => [
        'get' => [
            'summary' => 'Get QR Codes',
            'description' => 'Retrieve list of all QR codes',
            'tags' => ['QR Codes'],
            'parameters' => [
                [
                    'name' => 'action',
                    'in' => 'query',
                    'required' => true,
                    'schema' => [
                        'type' => 'string',
                        'enum' => ['list']
                    ]
                ]
            ],
            'responses' => [
                200 => [
                    'description' => 'List of QR codes',
                    'content' => [
                        'application/json' => [
                            'schema' => [
                                'type' => 'array',
                                'items' => ['$ref' => '#/components/schemas/QR']
                            ]
                        ]
                    ]
                ]
            ]
        ],
        'post' => [
            'summary' => 'Manage QR Codes',
            'description' => 'Create, update, or delete QR codes',
            'tags' => ['QR Codes'],
            'parameters' => [
                [
                    'name' => 'action',
                    'in' => 'query',
                    'required' => true,
                    'schema' => [
                        'type' => 'string',
                        'enum' => ['add', 'update', 'delete']
                    ]
                ]
            ],
            'requestBody' => [
                'required' => true,
                'content' => [
                    'application/json' => [
                        'schema' => [
                            'type' => 'object',
                            'properties' => [
                                'qr_id' => ['type' => 'integer'],
                                'qr_code' => ['type' => 'string'],
                                'location_id' => ['type' => 'integer']
                            ]
                        ]
                    ]
                ]
            ],
            'responses' => [
                200 => [
                    'description' => 'QR code operation successful',
                    'content' => [
                        'application/json' => [
                            'schema' => ['$ref' => '#/components/schemas/Success']
                        ]
                    ]
                ]
            ]
        ]
    ],

    // Fun Facts endpoints
    '/fun_fact.php' => [
        'get' => [
            'summary' => 'Get Fun Facts',
            'description' => 'Retrieve list of all fun facts and riddles',
            'tags' => ['Fun Facts'],
            'parameters' => [
                [
                    'name' => 'action',
                    'in' => 'query',
                    'required' => true,
                    'schema' => [
                        'type' => 'string',
                        'enum' => ['list']
                    ]
                ]
            ],
            'responses' => [
                200 => [
                    'description' => 'List of fun facts',
                    'content' => [
                        'application/json' => [
                            'schema' => [
                                'type' => 'array',
                                'items' => ['$ref' => '#/components/schemas/FunFact']
                            ]
                        ]
                    ]
                ]
            ]
        ],
        'post' => [
            'summary' => 'Manage Fun Facts',
            'description' => 'Create, update, or delete fun facts and riddles',
            'tags' => ['Fun Facts'],
            'parameters' => [
                [
                    'name' => 'action',
                    'in' => 'query',
                    'required' => true,
                    'schema' => [
                        'type' => 'string',
                        'enum' => ['add', 'update', 'delete']
                    ]
                ]
            ],
            'requestBody' => [
                'required' => true,
                'content' => [
                    'application/json' => [
                        'schema' => [
                            'type' => 'object',
                            'properties' => [
                                'fun_fact_id' => ['type' => 'integer'],
                                'qr_id' => ['type' => 'integer'],
                                'fact_text' => ['type' => 'string'],
                                'hint_text' => ['type' => 'string'],
                                'hint_2' => ['type' => 'string'],
                                'hint_3' => ['type' => 'string']
                            ]
                        ]
                    ]
                ]
            ],
            'responses' => [
                200 => [
                    'description' => 'Fun fact operation successful',
                    'content' => [
                        'application/json' => [
                            'schema' => ['$ref' => '#/components/schemas/Success']
                        ]
                    ]
                ]
            ]
        ]
    ],

    // Trail endpoints
    '/trail.php' => [
        'get' => [
            'summary' => 'Get Trails',
            'description' => 'Retrieve list of all trails',
            'tags' => ['Trails'],
            'parameters' => [
                [
                    'name' => 'action',
                    'in' => 'query',
                    'required' => true,
                    'schema' => [
                        'type' => 'string',
                        'enum' => ['list']
                    ]
                ]
            ],
            'responses' => [
                200 => [
                    'description' => 'List of trails',
                    'content' => [
                        'application/json' => [
                            'schema' => [
                                'type' => 'array',
                                'items' => ['$ref' => '#/components/schemas/Trail']
                            ]
                        ]
                    ]
                ]
            ]
        ],
        'post' => [
            'summary' => 'Manage Trails',
            'description' => 'Create, update, or delete trails',
            'tags' => ['Trails'],
            'parameters' => [
                [
                    'name' => 'action',
                    'in' => 'query',
                    'required' => true,
                    'schema' => [
                        'type' => 'string',
                        'enum' => ['add', 'update', 'delete']
                    ]
                ]
            ],
            'requestBody' => [
                'required' => true,
                'content' => [
                    'application/json' => [
                        'schema' => [
                            'type' => 'object',
                            'properties' => [
                                'trail_id' => ['type' => 'integer'],
                                'trail_name' => ['type' => 'string'],
                                'description' => ['type' => 'string'],
                                'start_lat' => ['type' => 'number'],
                                'start_lng' => ['type' => 'number'],
                                'end_lat' => ['type' => 'number'],
                                'end_lng' => ['type' => 'number']
                            ]
                        ]
                    ]
                ]
            ],
            'responses' => [
                200 => [
                    'description' => 'Trail operation successful',
                    'content' => [
                        'application/json' => [
                            'schema' => ['$ref' => '#/components/schemas/Success']
                        ]
                    ]
                ]
            ]
        ]
    ],

    // Badge endpoints
    '/badge.php' => [
        'get' => [
            'summary' => 'Get Badges',
            'description' => 'Retrieve list of all badges',
            'tags' => ['Badges'],
            'parameters' => [
                [
                    'name' => 'action',
                    'in' => 'query',
                    'required' => true,
                    'schema' => [
                        'type' => 'string',
                        'enum' => ['list', 'user_badges']
                    ]
                ],
                [
                    'name' => 'user_id',
                    'in' => 'query',
                    'required' => false,
                    'schema' => ['type' => 'integer']
                ]
            ],
            'responses' => [
                200 => [
                    'description' => 'List of badges',
                    'content' => [
                        'application/json' => [
                            'schema' => [
                                'type' => 'array',
                                'items' => ['$ref' => '#/components/schemas/Badge']
                            ]
                        ]
                    ]
                ]
            ]
        ],
        'post' => [
            'summary' => 'Manage Badges',
            'description' => 'Create, update, or delete badges',
            'tags' => ['Badges'],
            'parameters' => [
                [
                    'name' => 'action',
                    'in' => 'query',
                    'required' => true,
                    'schema' => [
                        'type' => 'string',
                        'enum' => ['add', 'update', 'delete']
                    ]
                ]
            ],
            'requestBody' => [
                'required' => true,
                'content' => [
                    'application/json' => [
                        'schema' => [
                            'type' => 'object',
                            'properties' => [
                                'badge_id' => ['type' => 'integer'],
                                'name' => ['type' => 'string'],
                                'description' => ['type' => 'string'],
                                'criteria_type' => ['type' => 'string'],
                                'image_path' => ['type' => 'string']
                            ]
                        ]
                    ]
                ]
            ],
            'responses' => [
                200 => [
                    'description' => 'Badge operation successful',
                    'content' => [
                        'application/json' => [
                            'schema' => ['$ref' => '#/components/schemas/Success']
                        ]
                    ]
                ]
            ]
        ]
    ],

    // Gallery endpoints
    '/gallery.php' => [
        'get' => [
            'summary' => 'Get Gallery Images',
            'description' => 'Retrieve list of all gallery images',
            'tags' => ['Gallery'],
            'parameters' => [
                [
                    'name' => 'action',
                    'in' => 'query',
                    'required' => true,
                    'schema' => [
                        'type' => 'string',
                        'enum' => ['list']
                    ]
                ]
            ],
            'responses' => [
                200 => [
                    'description' => 'List of gallery images',
                    'content' => [
                        'application/json' => [
                            'schema' => [
                                'type' => 'array',
                                'items' => ['$ref' => '#/components/schemas/Gallery']
                            ]
                        ]
                    ]
                ]
            ]
        ],
        'post' => [
            'summary' => 'Manage Gallery',
            'description' => 'Create, update, or delete gallery images',
            'tags' => ['Gallery'],
            'parameters' => [
                [
                    'name' => 'action',
                    'in' => 'query',
                    'required' => true,
                    'schema' => [
                        'type' => 'string',
                        'enum' => ['add', 'update', 'delete']
                    ]
                ]
            ],
            'requestBody' => [
                'required' => true,
                'content' => [
                    'application/json' => [
                        'schema' => [
                            'type' => 'object',
                            'properties' => [
                                'gallery_id' => ['type' => 'integer'],
                                'location_id' => ['type' => 'integer'],
                                'image_path' => ['type' => 'string'],
                                'caption' => ['type' => 'string']
                            ]
                        ]
                    ]
                ]
            ],
            'responses' => [
                200 => [
                    'description' => 'Gallery operation successful',
                    'content' => [
                        'application/json' => [
                            'schema' => ['$ref' => '#/components/schemas/Success']
                        ]
                    ]
                ]
            ]
        ]
    ],

    // Leaderboard endpoint
    '/leaderboard.php' => [
        'get' => [
            'summary' => 'Get Leaderboard',
            'description' => 'Retrieve user leaderboard rankings',
            'tags' => ['Leaderboard'],
            'parameters' => [
                [
                    'name' => 'action',
                    'in' => 'query',
                    'required' => true,
                    'schema' => [
                        'type' => 'string',
                        'enum' => ['list']
                    ]
                ]
            ],
            'responses' => [
                200 => [
                    'description' => 'Leaderboard data',
                    'content' => [
                        'application/json' => [
                            'schema' => [
                                'type' => 'object',
                                'properties' => [
                                    'leaderboard' => [
                                        'type' => 'array',
                                        'items' => ['$ref' => '#/components/schemas/Leaderboard']
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ],

    // VAPID endpoint
    '/get_vapid_public.php' => [
        'get' => [
            'summary' => 'Get VAPID Public Key',
            'description' => 'Retrieve VAPID public key for push notifications',
            'tags' => ['Push Notifications'],
            'responses' => [
                200 => [
                    'description' => 'VAPID public key',
                    'content' => [
                        'application/json' => [
                            'schema' => [
                                'type' => 'object',
                                'properties' => [
                                    'success' => ['type' => 'boolean'],
                                    'publicKey' => ['type' => 'string']
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ]
];

// Add paths to OpenAPI spec
$openApi['paths'] = $paths;

// Add tags
$openApi['tags'] = [
    ['name' => 'Authentication', 'description' => 'User and admin authentication'],
    ['name' => 'Users', 'description' => 'User management'],
    ['name' => 'Admins', 'description' => 'Admin management'],
    ['name' => 'Categories', 'description' => 'Location categories'],
    ['name' => 'Locations', 'description' => 'Heritage locations'],
    ['name' => 'QR Codes', 'description' => 'QR code management'],
    ['name' => 'Fun Facts', 'description' => 'Riddles and fun facts'],
    ['name' => 'Trails', 'description' => 'Heritage trails'],
    ['name' => 'Badges', 'description' => 'User badges and achievements'],
    ['name' => 'Gallery', 'description' => 'Image gallery'],
    ['name' => 'Leaderboard', 'description' => 'User rankings and scores'],
    ['name' => 'Push Notifications', 'description' => 'Web push notifications']
];

// Output the OpenAPI specification
echo json_encode($openApi, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>
