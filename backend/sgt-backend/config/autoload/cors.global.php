<?php

return [
    'cors' => [
        'origin' => [
            'https://proyecto-sgt-por-angular.vercel.app',
            'http://localhost:4200',
        ],
        'allowed_headers'  => ['Authorization', 'Content-Type', 'Accept'],
        'allowed_methods'  => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        'max_age'          => 3600,
        'expose_headers'   => [],
        'credentials'      => true,
    ],
];