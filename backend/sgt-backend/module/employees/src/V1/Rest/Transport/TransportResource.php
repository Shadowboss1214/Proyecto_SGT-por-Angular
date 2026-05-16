<?php

namespace employees\V1\Rest\Transport;

use Laminas\ApiTools\ApiProblem\Exception\DomainException;
use Laminas\ApiTools\DbConnectedResource;

class TransportResource extends DbConnectedResource
{
    public function create($data)
    {
        // 1. Obtenemos los datos del input filter (igual que el padre)
        $filter = $this->getInputFilter();
        if (null !== $filter) {
            $data = $filter->getValues();
        } else {
            $data = (array) $data;
        }

        // 2. Eliminamos el identificador para que Supabase lo genere con nextval()
        unset($data[$this->identifierName]);

        // 3. Eliminamos cualquier valor null para no violar constraints NOT NULL
        $data = array_filter($data, fn($value) => $value !== null);

        // 4. Insertamos el registro
        $this->table->insert($data);

        // 5. Recuperamos el registro recien insertado.
        //    getLastInsertValue() no funciona con PostgreSQL, asi que buscamos
        //    por 'plate' que es UNIQUE en la tabla transport.
        if (isset($data['plate'])) {
            $resultSet = $this->table->select(['plate' => $data['plate']]);
            if ($resultSet->count() > 0) {
                return $resultSet->current();
            }
        }

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