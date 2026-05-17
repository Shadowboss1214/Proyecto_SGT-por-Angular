#!/usr/bin/env php
<?php

$host     = getenv('DB_HOST');
$name     = getenv('DB_NAME');
$user     = getenv('DB_USER');
$password = getenv('DB_PASSWORD');
$port     = getenv('DB_PORT') ?: '5432';
$dsn      = "pgsql:host=$host;port=$port;dbname=$name;sslmode=require";
$pubKey   = __DIR__ . '/../config/autoload/public.key';
$privKey  = __DIR__ . '/../config/autoload/private.key';

// Escribir las llaves desde variables de entorno
file_put_contents(__DIR__ . '/../config/autoload/private.key', getenv('JWT_PRIVATE_KEY'));
file_put_contents(__DIR__ . '/../config/autoload/public.key', getenv('JWT_PUBLIC_KEY'));

$config = <<<PHP
<?php
return [
    'db' => [
        'adapters' => [
            'db_oauth2' => [
                'database' => '$name',
                'driver'   => 'PDO_Pgsql',
                'hostname' => '$host',
                'username' => '$user',
                'password' => '$password',
                'port'     => '$port',
            ],
        ],
    ],
    'api-tools-mvc-auth' => [
        'authentication' => [
            'adapters' => [
                'oauth2postgres' => [
                    'adapter' => \Laminas\ApiTools\MvcAuth\Authentication\OAuth2Adapter::class,
                    'storage' => [
                        'adapter'              => \pdo::class,
                        'dsn'                  => '$dsn',
                        'route'                => '/oauth',
                        'username'             => '$user',
                        'password'             => '$password',
                        'use_jwt_access_tokens' => true,
                        'public_key'           => '$pubKey',
                        'private_key'          => '$privKey',
                        'jwt_extra_payload_callable' => function (array \$params) {
                            try {
                                \$pdo = new \PDO(
                                    '$dsn',
                                    '$user',
                                    '$password'
                                );
                                \$stmt = \$pdo->prepare('SELECT id_employee, role FROM employees WHERE username = ?');
                                \$stmt->execute([\$params['user_id']]);
                                \$employee = \$stmt->fetch(\PDO::FETCH_ASSOC);
                                if (\$employee) {
                                    return [
                                        'role'       => \$employee['role'],
                                        'employeeId' => (int) \$employee['id_employee'],
                                    ];
                                }
                            } catch (\Exception \$e) {}
                            return [];
                        },
                    ],
                ],
            ],
        ],
    ],
];
PHP;

file_put_contents(__DIR__ . '/../config/autoload/local.php', $config);
echo "Configuración generada correctamente.\n";