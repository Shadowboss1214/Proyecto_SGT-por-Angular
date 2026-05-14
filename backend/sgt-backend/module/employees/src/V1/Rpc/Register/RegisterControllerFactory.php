<?php
namespace employees\V1\Rpc\Register;

class RegisterControllerFactory
{
    public function __invoke($container)
    {
        $db = $container->get('db_oauth2');
        return new RegisterController($db);
    }
}
