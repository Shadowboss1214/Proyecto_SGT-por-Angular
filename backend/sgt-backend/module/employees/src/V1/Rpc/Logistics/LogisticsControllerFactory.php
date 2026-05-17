<?php

namespace employees\V1\Rpc\Logistics;

class LogisticsControllerFactory
{
    public function __invoke($container)
    {
        $db = $container->get('db_oauth2');
        return new LogisticsController($db);
    }
}
