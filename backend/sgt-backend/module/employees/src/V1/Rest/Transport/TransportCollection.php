<?php
namespace employees\V1\Rest\Transport;

use Laminas\Paginator\Paginator;

class TransportCollection extends Paginator
{
    public function __construct($adapter)
    {
        parent::__construct($adapter);

        $this->setItemCountPerPage(20);

        $this->setCurrentPageNumber(1);
    }
}