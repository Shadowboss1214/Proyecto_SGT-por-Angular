<?php
namespace employees\V1\Rest\Employees;

use Laminas\Paginator\Paginator;

/**
 * Colección paginada de EmployeesEntity para respuestas REST de lista.
 *
 * Extiende Paginator para que Laminas Content Negotiation inyecte automáticamente
 * los metadatos de paginación (_page, _per_page, _total) en las respuestas HAL+JSON.
 *
 * @package employees\V1\Rest\Employees
 */
class EmployeesCollection extends Paginator
{
}
