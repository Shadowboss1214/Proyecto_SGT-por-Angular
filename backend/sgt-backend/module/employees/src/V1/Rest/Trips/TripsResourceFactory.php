<?php
namespace employees\V1\Rest\Trips;

class TripsResourceFactory
{
    public function __invoke($services)
    {
        return new TripsResource();
    }
}
