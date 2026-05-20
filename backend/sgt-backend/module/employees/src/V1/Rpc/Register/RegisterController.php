<?php

namespace employees\V1\Rpc\Register;

use Laminas\Mvc\Controller\AbstractActionController;
use Laminas\ApiTools\ApiProblem\ApiProblemResponse;
use Laminas\ApiTools\ApiProblem\ApiProblem;
use Laminas\ApiTools\ContentNegotiation\ViewModel;

/**
 * Controlador RPC para el registro de nuevos empleados.
 *
 * Recibe un JSON POST, valida los campos obligatorios, hashea la contraseña con
 * bcrypt e inserta atómicamente en `oauth_users` y `employees` de PostgreSQL.
 *
 * @package employees\V1\Rpc\Register
 */
class RegisterController extends AbstractActionController
{
    private \Laminas\Db\Adapter\Adapter $db;

    /**
     * @param \Laminas\Db\Adapter\Adapter $db Adaptador de base de datos inyectado por la fábrica.
     */
    public function __construct(\Laminas\Db\Adapter\Adapter $db)
    {
        $this->db = $db;
    }

    /**
     * Registra un nuevo empleado creando simultáneamente su credencial OAuth2 y su perfil.
     *
     * Precondición: el cuerpo JSON debe contener username, password, name, salary y role.
     * Postcondición: se insertan filas en `oauth_users` (password hasheado con bcrypt)
     * y en `employees`; la respuesta lleva `registered: true`.
     *
     * @return ViewModel|ApiProblemResponse
     * @throws \Laminas\Db\Adapter\Exception\InvalidQueryException Si la consulta SQL falla.
     */
    public function registerAction()
    {
        $data = $this->getRequest()->getContent();
        $body = json_decode($data, true);

        $username = $body['username'] ?? null;
        $password = $body['password'] ?? null;
        $name     = $body['name'] ?? null;
        $salary   = $body['salary'] ?? null;
        $role     = $body['role'] ?? null;

        if (!$username || !$password || !$name || !$salary || !$role) {
            return new ApiProblemResponse(
                new ApiProblem(400, 'username, password, name, salary and role are required')
            );
        }

        $hashed = password_hash($password, PASSWORD_BCRYPT);

        $this->db->query(
            'INSERT INTO oauth_users (username, password) VALUES (?, ?)',
            [$username, $hashed]
        );

        $this->db->query(
            'INSERT INTO employees (name, salary, role, username) VALUES (?, ?, ?, ?)',
            [$name, $salary, $role, $username]
        );

        return new ViewModel(['registered' => true]);
    }
}
