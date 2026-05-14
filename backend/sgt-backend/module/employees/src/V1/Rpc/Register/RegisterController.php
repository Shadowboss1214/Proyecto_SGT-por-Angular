<?php

namespace employees\V1\Rpc\Register;

use Laminas\Mvc\Controller\AbstractActionController;
use Laminas\ApiTools\ApiProblem\ApiProblemResponse;
use Laminas\ApiTools\ApiProblem\ApiProblem;
use Laminas\ApiTools\ContentNegotiation\ViewModel;

class RegisterController extends AbstractActionController
{
    private \Laminas\Db\Adapter\Adapter $db;

    public function __construct(\Laminas\Db\Adapter\Adapter $db)
    {
        $this->db = $db;
    }

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
