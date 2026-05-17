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
                        'use_jwt_access_tokens' => true,
                        'public_key'  => __DIR__ . '/public.key',
                        'private_key' => __DIR__ . '/private.key',
                        'jwt_extra_payload_callable' => function (array $params) {
                            try {
                                $pdo = new \PDO(
                                    'pgsql:host=aws-1-us-west-2.pooler.supabase.com;port=5432;dbname=postgres;sslmode=require',
                                    'postgres.jlysvnwaujuavccgalel',
                                    'Cug14VGq3THC9W1F'
                                );
                                $stmt = $pdo->prepare('SELECT id_employee, role FROM employees WHERE username = ?');
                                $stmt->execute([$params['user_id']]);
                                $employee = $stmt->fetch(\PDO::FETCH_ASSOC);
                                if ($employee) {
                                    return [
                                        'role'       => $employee['role'],
                                        'employeeId' => (int) $employee['id_employee'],
                                    ];
                                }
                            } catch (\Exception $e) {}
                            return [];
                        },
                    ],
                ],
            ],
        ],
    ],
];