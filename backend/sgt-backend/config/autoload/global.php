<?php
return [
    'api-tools-content-negotiation' => [
        'selectors' => [],
    ],
    'db' => [
        'adapters' => [
            'db_oauth2' => [],
        ],
    ],
    'router' => [
        'routes' => [
            'oauth' => [
                'options' => [
                    'spec' => '%oauth%',
                    'regex' => '(?P<oauth>(/oauth))',
                ],
                'type' => 'regex',
            ],
        ],
    ],
];
