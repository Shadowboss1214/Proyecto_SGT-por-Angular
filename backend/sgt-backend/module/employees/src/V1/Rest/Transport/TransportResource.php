<?php
namespace employees\V1\Rest\Transport;

use Laminas\ApiTools\DbConnectedResource;

class TransportResource extends DbConnectedResource
{
    public function create($data)
    {
        // Convertimos a array por si viene como objeto
        $data = (array) $data;

        // Eliminamos id_transport para que Supabase lo genere con nextval()
        unset($data['id_transport']);

        return parent::create($data);
    }
}