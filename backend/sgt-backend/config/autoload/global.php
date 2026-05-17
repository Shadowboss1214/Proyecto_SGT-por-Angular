<?php
/**
 * Configuración global de la aplicación Laminas: negociación de contenido,
 * adaptadores de BD, enrutamiento OAuth2 y mapeo de autenticación por módulo.
 *
 * El bloque `api-tools-mvc-auth.authentication.map` es el contrato crítico: fuerza
 * la validación del Bearer token en todos los endpoints de `employees\V1` usando el
 * adaptador `oauth2postgres`, cuyas credenciales se definen en oauth2.local.php.
 *
 * @package sgt-backend
 */
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
    'api-tools-mvc-auth' => [
        'authentication' => [
            'map' => [
                'employees\\V1' => 'oauth2postgres',
            ],
        ],
    ],
];