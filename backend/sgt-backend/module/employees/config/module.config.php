<?php
return [
    'router' => [
        'routes' => [
            'employees.rest.employees' => [
                'type' => 'Segment',
                'options' => [
                    'route' => '/employees[/:employee_id]',
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
            'employees.rest.transport' => [
                'type' => 'Segment',
                'options' => [
                    'route' => '/transport[/:id_transport]',
                    'defaults' => [
                        'controller' => 'employees\\V1\\Rest\\Transport\\Controller',
                    ],
                ],
            ],
            'employees.rest.trips' => [
                'type' => 'Segment',
                'options' => [
                    'route' => '/trips[/:id_trip]',
                    'defaults' => [
                        'controller' => 'employees\\V1\\Rest\\Trips\\Controller',
                    ],
                ],
            ],
        ],
    ],
    'api-tools-versioning' => [
        'uri' => [
            0 => 'employees.rest.employees',
            1 => 'employees.rpc.register',
            2 => 'employees.rest.transport',
            3 => 'employees.rest.trips',
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
                4 => 'POST',
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
        'employees\\V1\\Rest\\Transport\\Controller' => [
            'listener' => \employees\V1\Rest\Transport\TransportResource::class,
            'route_name' => 'employees.rest.transport',
            'route_identifier_name' => 'transport_id',
            'collection_name' => 'transport',
            'entity_http_methods' => [
                0 => 'GET',
                1 => 'PATCH',
                2 => 'DELETE',
                3 => 'PUT',
            ],
            'collection_http_methods' => [
                0 => 'GET',
                1 => 'POST',
            ],
            'collection_query_whitelist' => [],
            'page_size' => 25,
            'page_size_param' => null,
            'entity_class' => \employees\V1\Rest\Transport\TransportEntity::class,
            'collection_class' => \employees\V1\Rest\Transport\TransportCollection::class,
            'service_name' => 'transport',
        ],
        'employees\\V1\\Rest\\Trips\\Controller' => [
            'listener' => \employees\V1\Rest\Trips\TripsResource::class,
            'route_name' => 'employees.rest.trips',
            'route_identifier_name' => 'trips_id',
            'collection_name' => 'trips',
            'entity_http_methods' => [
                0 => 'GET',
                1 => 'PATCH',
                2 => 'PUT',
                3 => 'DELETE',
                4 => 'POST',
            ],
            'collection_http_methods' => [
                0 => 'GET',
                1 => 'POST',
            ],
            'collection_query_whitelist' => [],
            'page_size' => 25,
            'page_size_param' => null,
            'entity_class' => \employees\V1\Rest\Trips\TripsEntity::class,
            'collection_class' => \employees\V1\Rest\Trips\TripsCollection::class,
            'service_name' => 'trips',
        ],
    ],
    'api-tools-content-negotiation' => [
        'controllers' => [
            'employees\\V1\\Rest\\Employees\\Controller' => 'HalJson',
            'employees\\V1\\Rpc\\Register\\Controller' => 'Json',
            'employees\\V1\\Rest\\Transport\\Controller' => 'HalJson',
            'employees\\V1\\Rest\\Trips\\Controller' => 'HalJson',
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
            'employees\\V1\\Rest\\Transport\\Controller' => [
                0 => 'application/vnd.employees.v1+json',
                1 => 'application/hal+json',
                2 => 'application/json',
            ],
            'employees\\V1\\Rest\\Trips\\Controller' => [
                0 => 'application/vnd.employees.v1+json',
                1 => 'application/hal+json',
                2 => 'application/json',
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
            'employees\\V1\\Rest\\Transport\\Controller' => [
                0 => 'application/vnd.employees.v1+json',
                1 => 'application/json',
            ],
            'employees\\V1\\Rest\\Trips\\Controller' => [
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
            \employees\V1\Rest\Transport\TransportEntity::class => [
                'entity_identifier_name' => 'id_transport',
                'route_name' => 'employees.rest.transport',
                'route_identifier_name' => 'transport_id',
                'hydrator' => \Laminas\Hydrator\ArraySerializableHydrator::class,
            ],
            \employees\V1\Rest\Transport\TransportCollection::class => [
                'entity_identifier_name' => 'id_transport',
                'route_name' => 'employees.rest.transport',
                'route_identifier_name' => 'transport_id',
                'is_collection' => true,
            ],
            \employees\V1\Rest\Trips\TripsEntity::class => [
                'entity_identifier_name' => 'id_trip',
                'route_name' => 'employees.rest.trips',
                'route_identifier_name' => 'trips_id',
                'hydrator' => \Laminas\Hydrator\ArraySerializableHydrator::class,
            ],
            \employees\V1\Rest\Trips\TripsCollection::class => [
                'entity_identifier_name' => 'id_trip',
                'route_name' => 'employees.rest.trips',
                'route_identifier_name' => 'trips_id',
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
            \employees\V1\Rest\Transport\TransportResource::class => [
                'adapter_name' => 'db_oauth2',
                'table_name' => 'transport',
                'hydrator_name' => \Laminas\Hydrator\ArraySerializableHydrator::class,
                'controller_service_name' => 'employees\\V1\\Rest\\Transport\\Controller',
                'entity_identifier_name' => 'id_transport',
                'table_service' => 'employees\\V1\\Rest\\Transport\\TransportResource\\Table',
                'resource_class' => \employees\V1\Rest\Transport\TransportResource::class,
            ],
            \employees\V1\Rest\Trips\TripsResource::class => [                                                                                                        
                'adapter_name' => 'db_oauth2',                                                                                                                        
                'table_name' => 'trip',                                                                                                                              
                'hydrator_name' => \Laminas\Hydrator\ArraySerializableHydrator::class,                                                                                
                'controller_service_name' => 'employees\\V1\\Rest\\Trips\\Controller',                                                                                
                'entity_identifier_name' => 'id_trip',                                                                                                                
                'table_service' => 'employees\\V1\\Rest\\Trips\\TripsResource\\Table',                                                                                
                'resource_class' => \employees\V1\Rest\Trips\TripsResource::class,                                                                                    
            ],
        ],
    ],
    'api-tools-content-validation' => [
        'employees\\V1\\Rest\\Employees\\Controller' => [
            'input_filter' => 'employees\\V1\\Rest\\Employees\\Validator',
        ],
        'employees\\V1\\Rest\\Transport\\Controller' => [
            'input_filter' => 'employees\\V1\\Rest\\Transport\\Validator',
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
        'employees\\V1\\Rest\\Transport\\Validator' => [
            0 => [
                'name' => 'id_transport',
                'required' => false,
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
                'name' => 'type',
                'required' => true,
                'filters' => [],
                'validators' => [],
            ],
            3 => [
                'name' => 'plate',
                'required' => true,
                'filters' => [],
                'validators' => [
                    0 => [
                        'name' => 'Laminas\\ApiTools\\ContentValidation\\Validator\\DbNoRecordExists',
                        'options' => [
                            'adapter' => 'db_oauth2',
                            'table' => 'transport',
                            'field' => 'plate',
                        ],
                    ],
                ],
            ],
            4 => [
                'name' => 'status',
                'required' => true,
                'filters' => [],
                'validators' => [],
            ],
            5 => [
                'name' => 'costperkm',
                'required' => true,
                'filters' => [],
                'validators' => [],
            ],
            6 => [
                'name' => 'maintenancecost',
                'required' => true,
                'filters' => [],
                'validators' => [],
            ],
            7 => [
                'name' => 'fuelconsumption',
                'required' => true,
                'filters' => [],
                'validators' => [],
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
            'employees\\V1\\Rest\\Transport\\Controller' => [
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
