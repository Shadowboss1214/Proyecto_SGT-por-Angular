<?php

namespace employees\V1\Rpc\Qr;

use Laminas\ServiceManager\Factory\FactoryInterface;
use Interop\Container\ContainerInterface;

class QrControllerFactory implements FactoryInterface
{
    public function __invoke(ContainerInterface $container, $requestedName, ?array $options = null): QrController
    {
        return new QrController();
    }
}
