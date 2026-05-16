<?php

namespace employees\V1\Rpc\Logistics;

use Laminas\Mvc\Controller\AbstractActionController;
use Laminas\ApiTools\ContentNegotiation\ViewModel;

class LogisticsController extends AbstractActionController
{
    private \Laminas\Db\Adapter\Adapter $db;

    public function __construct(\Laminas\Db\Adapter\Adapter $db)
    {
        $this->db = $db;
    }

    public function logisticsAction()
    {
        $totals = $this->db->query(
            'SELECT COUNT(*) AS total_trips,
                    COALESCE(SUM(income), 0)   AS total_income,
                    COALESCE(SUM(fuelcost), 0) AS total_cost
             FROM trip',
            []
        )->current();

        $totalIncome = (float) $totals['total_income'];
        $totalCost   = (float) $totals['total_cost'];
        $totalTrips  = (int)   $totals['total_trips'];
        $profit      = $totalIncome - $totalCost;
        $efficiency  = $totalCost > 0 ? round(($profit / $totalCost) * 100, 2) : 0;

        if ($profit < 0) {
            $insight = 'Estás perdiendo dinero en operaciones';
        } elseif ($efficiency < 20) {
            $insight = 'Baja eficiencia operativa';
        } else {
            $insight = 'Operación saludable';
        }

        $rows = $this->db->query(
            'SELECT date, COUNT(*) AS count FROM trip GROUP BY date ORDER BY date ASC',
            []
        );

        $tripsByDay = [];
        foreach ($rows as $row) {
            $tripsByDay[$row['date']] = (int) $row['count'];
        }

        return new ViewModel([
            'total_income'  => $totalIncome,
            'total_cost'    => $totalCost,
            'profit'        => $profit,
            'efficiency'    => $efficiency,
            'total_trips'   => $totalTrips,
            'trips_by_day'  => $tripsByDay,
            'insight'       => $insight,
        ]);
    }
}
