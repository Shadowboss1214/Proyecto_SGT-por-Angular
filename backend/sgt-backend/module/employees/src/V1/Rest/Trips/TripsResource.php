<?php
namespace employees\V1\Rest\Trips;

use Laminas\ApiTools\ApiProblem\ApiProblem;
use Laminas\ApiTools\ApiProblem\Exception\DomainException;
// use Laminas\ApiTools\Rest\AbstractResourceListener;
use Laminas\ApiTools\DbConnectedResource;
// use Laminas\Stdlib\Parameters;

class TripsResource extends DbConnectedResource
{
    /**
     * Create a resource
     *
     * @param  mixed $data
     * @return ApiProblem|mixed
     */
    public function create($data)
    {
        $filter = $this->getInputFilter();
        if (null !== $filter) {
            $data = $filter->getValues();
        } else {
            $data = (array) $data;
        }

        unset($data[$this->identifierName]);
        $data = array_filter($data, fn($value) => $value !== null);

        $this->table->insert($data);

        // 6. Fallback: obtener el ultimo registro insertado por ID descendente
        $sql    = $this->table->getSql();
        $select = $sql->select()->order($this->identifierName . ' DESC')->limit(1);
        $resultSet = $this->table->selectWith($select);
        if ($resultSet->count() > 0) {
            return $resultSet->current();
        }

        throw new DomainException('Item not found after insert', 404);
    }

}
