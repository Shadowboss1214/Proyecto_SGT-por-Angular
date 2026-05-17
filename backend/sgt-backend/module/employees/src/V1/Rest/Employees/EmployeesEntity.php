<?php
namespace employees\V1\Rest\Employees;

use ArrayObject;

/**
 * Representa un registro individual de empleado serializable a HAL+JSON.
 *
 * Wrapper mínimo sobre ArrayObject que Laminas HAL usa para serializar cada fila
 * de la tabla `employees` como recurso embebido en las respuestas REST.
 *
 * @package employees\V1\Rest\Employees
 */
class EmployeesEntity extends ArrayObject
{
}
