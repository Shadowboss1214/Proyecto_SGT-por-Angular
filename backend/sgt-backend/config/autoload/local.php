<?php
return [
    'db' => [
        'adapters' => [
            'db_oauth2' => [
                'database' => 'postgres',
                'driver' => 'PDO_Pgsql',
                'hostname' => 'aws-1-us-west-2.pooler.supabase.com',
                'username' => 'postgres.jlysvnwaujuavccgalel',
                'password' => 'Cug14VGq3THC9W1F',
                'port' => '5432',
                // Eliminamos la línea problemática y simplificamos
            ],
        ],
    ],
    'api-tools-mvc-auth' => [
        'authentication' => [
            'adapters' => [
                'oauth2postgres' => [
                    'adapter' => \Laminas\ApiTools\MvcAuth\Authentication\OAuth2Adapter::class,
                    'storage' => [
                        'adapter' => \pdo::class,
                        'dsn' => 'pgsql:host=aws-1-us-west-2.pooler.supabase.com;port=5432;dbname=postgres;sslmode=require',
                        'route' => '/oauth',
                        'username' => 'postgres.jlysvnwaujuavccgalel',
                        'password' => 'Cug14VGq3THC9W1F',
                    ],
                ],
            ],
        ],
    ],
];