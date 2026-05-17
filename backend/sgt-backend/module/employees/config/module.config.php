<?php
/**
 * Configuración del módulo employees: rutas, controladores, content negotiation y autorización.
 *
 * Define las rutas REST (/employees[/:employees_id]) y RPC (/register), mapea cada URL
 * a su controlador, declara los verbos HTTP permitidos por colección/entidad y establece
 * las reglas de autorización OAuth2 por verbo.
 *
 * @package employees
 */
return [
    'router' => [
        'routes' => [
            'employees.rest.employees' => [
                'type' => 'Segment',
                'options' => [
                    'route' => '/employees[/:employees_id]',
                    'defaults' => [
                        'controller' => 'employees\\V1\\Rest\\Employees\\Controller',
                    ],
                ],
            ],
            'employees.rpc.register' => [
                'type' => 'Segment',
                'options' => [
                    'route' => '/register',
                    'defaults' => [
                        'controller' => 'employees\\V1\\Rpc\\Register\\Controller',
                        'action' => 'register',
                    ],
                ],
            ],
        ],
    ],
    'api-tools-versioning' => [
        'uri' => [
            0 => 'employees.rest.employees',
            1 => 'employees.rpc.register',
        ],
    ],
    'api-tools-rest' => [
        'employees\\V1\\Rest\\Employees\\Controller' => [
            'listener' => 'employees\\V1\\Rest\\Employees\\EmployeesResource',
            'route_name' => 'employees.rest.employees',
            'route_identifier_name' => 'employee_id',
            'collection_name' => 'employees',
            'entity_http_methods' => [
                0 => 'GET',
                1 => 'PATCH',
                2 => 'PUT',
                3 => 'DELETE',
            ],
            'collection_http_methods' => [
                0 => 'GET',
                1 => 'POST',
            ],
            'collection_query_whitelist' => [
                0 => 'username',
            ],
            'page_size' => 25,
            'page_size_param' => null,
            'entity_class' => \employees\V1\Rest\Employees\EmployeesEntity::class,
            'collection_class' => \employees\V1\Rest\Employees\EmployeesCollection::class,
            'service_name' => 'employees',
        ],
    ],
    'api-tools-content-negotiation' => [
        'controllers' => [
            'employees\\V1\\Rest\\Employees\\Controller' => 'HalJson',
            'employees\\V1\\Rpc\\Register\\Controller' => 'Json',
        ],
        'accept_whitelist' => [
            'employees\\V1\\Rest\\Employees\\Controller' => [
                0 => 'application/vnd.employees.v1+json',
                1 => 'application/hal+json',
                2 => 'application/json',
            ],
            'employees\\V1\\Rpc\\Register\\Controller' => [
                0 => 'application/vnd.employees.v1+json',
                1 => 'application/json',
                2 => 'application/*+json',
            ],
        ],
        'content_type_whitelist' => [
            'employees\\V1\\Rest\\Employees\\Controller' => [
                0 => 'application/vnd.employees.v1+json',
                1 => 'application/json',
            ],
            'employees\\V1\\Rpc\\Register\\Controller' => [
                0 => 'application/vnd.employees.v1+json',
                1 => 'application/json',
            ],
        ],
    ],
    'api-tools-hal' => [
        'metadata_map' => [
            \employees\V1\Rest\Employees\EmployeesEntity::class => [
                'entity_identifier_name' => 'id_employee',
                'route_name' => 'employees.rest.employees',
                'route_identifier_name' => 'employee_id',
                'hydrator' => \Laminas\Hydrator\ArraySerializableHydrator::class,
            ],
            \employees\V1\Rest\Employees\EmployeesCollection::class => [
                'entity_identifier_name' => 'id_employee',
                'route_name' => 'employees.rest.employees',
                'route_identifier_name' => 'employee_id',
                'is_collection' => true,
            ],
        ],
    ],
    'api-tools' => [
        'db-connected' => [
            'employees\\V1\\Rest\\Employees\\EmployeesResource' => [
                'adapter_name' => 'db_oauth2',
                'table_name' => 'employees',
                'hydrator_name' => \Laminas\Hydrator\ArraySerializableHydrator::class,
                'controller_service_name' => 'employees\\V1\\Rest\\Employees\\Controller',
                'entity_identifier_name' => 'id_employee',
                'table_service' => 'employees\\V1\\Rest\\Employees\\EmployeesResource\\Table',
            ],
        ],
    ],
    'api-tools-content-validation' => [
        'employees\\V1\\Rest\\Employees\\Controller' => [
            'input_filter' => 'employees\\V1\\Rest\\Employees\\Validator',
        ],
    ],
    'input_filter_specs' => [
        'employees\\V1\\Rest\\Employees\\Validator' => [
            0 => [
                'name' => 'id_employee',
                'required' => true,
                'filters' => [],
                'validators' => [],
            ],
            1 => [
                'name' => 'name',
                'required' => true,
                'filters' => [],
                'validators' => [],
            ],
            2 => [
                'name' => 'salary',
                'required' => true,
                'filters' => [],
                'validators' => [],
            ],
            3 => [
                'required' => true,
                'validators' => [],
                'filters' => [],
                'name' => 'role',
            ],
            4 => [
                'required' => true,
                'validators' => [],
                'filters' => [],
                'name' => 'username',
            ],
        ],
    ],
    'api-tools-mvc-auth' => [
        'authorization' => [
            'employees\\V1\\Rest\\Employees\\Controller' => [
                'collection' => [
                    'GET' => true,
                    'POST' => true,
                    'PUT' => false,
                    'PATCH' => false,
                    'DELETE' => false,
                ],
                'entity' => [
                    'GET' => true,
                    'POST' => false,
                    'PUT' => true,
                    'PATCH' => true,
                    'DELETE' => true,
                ],
            ],
        ],
    ],
    'controllers' => [
        'factories' => [
            'employees\\V1\\Rpc\\Register\\Controller' => \employees\V1\Rpc\Register\RegisterControllerFactory::class,
        ],
    ],
    'api-tools-rpc' => [
        'employees\\V1\\Rpc\\Register\\Controller' => [
            'service_name' => 'register',
            'http_methods' => [
                0 => 'POST',
            ],
            'route_name' => 'employees.rpc.register',
        ],
    ],
];
