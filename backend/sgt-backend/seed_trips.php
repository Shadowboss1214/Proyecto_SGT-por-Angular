<?php
$dsn      = 'pgsql:host=aws-1-us-west-2.pooler.supabase.com;port=5432;dbname=postgres;sslmode=require';
$username = 'postgres.jlysvnwaujuavccgalel';
$password = 'Cug14VGq3THC9W1F';

$pdo = new PDO($dsn, $username, $password);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Crear tabla route si no existe
$pdo->exec("
    CREATE TABLE IF NOT EXISTS route (
        id_route  SERIAL PRIMARY KEY,
        origin    VARCHAR(100) NOT NULL,
        destine   VARCHAR(100) NOT NULL,
        distance  NUMERIC(10,2) NOT NULL
    )
");

// Insertar rutas solo si no existen
$existing = $pdo->query("SELECT COUNT(*) FROM route")->fetchColumn();
if ($existing == 0) {
    $routes = [
        ['Ciudad de México', 'Guadalajara', 541],
        ['Guadalajara',      'Monterrey',  742],
        ['Ciudad de México', 'Monterrey',  921],
        ['Monterrey',        'Tijuana',   1891],
        ['Ciudad de México', 'Puebla',     132],
    ];
    $stmt = $pdo->prepare("INSERT INTO route (origin, destine, distance) VALUES (?, ?, ?)");
    foreach ($routes as $r) {
        $stmt->execute($r);
        echo "Ruta insertada: {$r[0]} -> {$r[1]}\n";
    }
} else {
    echo "Rutas ya existen ($existing).\n";
}

// Insertar 20 viajes
$trips = [
    [14, 7,  1, 12500, 3200, '2026-04-01'],
    [15, 8,  2, 18200, 4800, '2026-04-03'],
    [16, 9,  3, 22000, 5900, '2026-04-05'],
    [17, 10, 4, 35000, 9200, '2026-04-07'],
    [18, 11, 5,  8500, 2100, '2026-04-10'],
    [19, 12, 1, 13000, 3400, '2026-04-12'],
    [20, 13, 2, 17500, 4600, '2026-04-15'],
    [21, 14, 3, 21000, 5600, '2026-04-18'],
    [22, 15, 4, 33000, 8800, '2026-04-20'],
    [23, 16, 5,  9000, 2300, '2026-04-22'],
    [24, 7,  2, 16000, 4200, '2026-04-25'],
    [25, 8,  3, 20500, 5500, '2026-04-28'],
    [14, 9,  4, 31000, 8200, '2026-05-02'],
    [15, 10, 1, 11500, 3000, '2026-05-04'],
    [16, 11, 5,  9500, 2400, '2026-05-06'],
    [17, 12, 2, 19000, 5000, '2026-05-08'],
    [18, 13, 3, 23500, 6200, '2026-05-10'],
    [19, 14, 4, 36000, 9500, '2026-05-12'],
    [20, 15, 1, 14000, 3600, '2026-05-14'],
    [21, 16, 2, 18500, 4900, '2026-05-15'],
];

$stmt = $pdo->prepare("
    INSERT INTO trip (id_transport, id_employee, id_route, income, fuelcost, date)
    VALUES (?, ?, ?, ?, ?, ?)
");

foreach ($trips as $t) {
    $stmt->execute($t);
    echo "Viaje insertado: transporte {$t[0]}, empleado {$t[1]}, ruta {$t[2]}, fecha {$t[5]}\n";
}

echo "\nSeed completado.\n";
