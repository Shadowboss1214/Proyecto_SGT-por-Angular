# Proyecto_SGT por Angular
## Sistema de Gestión de Transportes (SGT) - Módulo de Control Administrativo

Aplicación web full-stack para la gestión administrativa de transportes, desarrollada como proyecto final para la asignatura Desarrollo Web de API y SPA, Universidad Autónoma De Yucatán.

## Ficha Técnica

### Frontend
| Tecnología              | Versión          |
|-------------------------|------------------|
| Angular                 | 21.1.0           |
| TypeScript              | ~5.9.2           |
| HTML/CSS                | -                |
| Chart.js + ng2-charts   | ^4.5.1 + ^10.0.0 |
| jsPDF + jsPDF-AutoTable | ^4.2.1 + ^5.0.7  |
| XLSX                    | ^0.18.5          |
| qrcode                  | ^1.5.4           |
| @types/qrcode           | ^1.5.6           |

### Backend
| Tecnología              | Versión              |
|-------------------------|----------------------|
| PHP                     | ~8.0 / ~8.1 / ~8.2   |
| Laminas API Tools       | ^1.7                 |
| Laminas API Tools OAuth2| ^1.9                 |
| PostgreSQL (Supabase)   | -                    |

### Base de datos
| Tecnología | Detalle |
|---|---|
| PostgreSQL | Hosteado en Supabase |

---

## Especificación 1 — Aplicación web con esquema MVC

> **Requisito:** Construir una aplicación web utilizando el esquema MVC.

### Cumplimiento

El proyecto implementa el patrón MVC en dos capas que se complementan:

- **Backend (Laminas API Tools / PHP):** sigue MVC de forma estricta. Los controladores extienden `AbstractActionController` de Laminas MVC, las entidades y colecciones representan la capa de Modelo, y la capa de Vista se materializa como respuestas JSON/HAL negociadas automáticamente por Laminas Content Negotiation.
- **Frontend (Angular SPA):** aplica una variante moderna del patrón. Las interfaces TypeScript son el Modelo; los servicios inyectables (`@Injectable`) actúan como capa de Control (lógica de negocio, acceso a datos vía HTTP); y los componentes standalone con sus plantillas HTML son la Vista. El Router de Angular dirige cada URL a su componente correspondiente, equivalente al dispatch del controlador.

Ambas capas se comunican exclusivamente a través de la API REST del backend; el frontend nunca accede directamente a la base de datos.

### Tecnología utilizada

| Tecnología / Paquete     | Versión      | Rol en MVC                                                         |
|--------------------------|--------------|--------------------------------------------------------------------|
| Angular                  | 21.1.0       | Framework SPA — View + Controller (componentes y servicios)        |
| TypeScript               | ~5.9.2       | Tipado de Modelos (interfaces de dominio)                          |
| `@angular/router`        | 21.1.0       | Dispatch de vistas por URL (equivalente al Front Controller)       |
| `@angular/common/http`   | 21.1.0       | Capa HTTP — comunicación Controller→API                            |
| PHP                      | ~8.0–8.2     | Lenguaje del backend                                               |
| Laminas API Tools        | ^1.7         | Framework MVC del servidor — routing, controllers, views JSON      |
| Laminas API Tools OAuth2 | ^1.9         | Autenticación OAuth2 integrada en la capa de Control               |
| PostgreSQL (Supabase)    | —            | Capa de persistencia del Modelo                                    |

### Arquitectura de la funcionalidad

```
BACKEND — Laminas PHP (MVC clásico)
┌──────────────────────────────────────────────┐
│  Model                                       │
│   EmployeesEntity  (ArrayObject)             │
│   EmployeesCollection  (Paginator)           │
│   oauth_users / employees  (tablas Supabase) │
│                                              │
│  Controller                                  │
│   IndexController  (AbstractActionController)│
│   RegisterController  (RPC)                  │
│   EmployeesResourceController  (REST)        │
│                                              │
│  View                                        │
│   HAL+JSON  (Laminas ContentNegotiation)     │
└─────────────────┬────────────────────────────┘
                  │  HTTP REST  (CORS habilitado)
                  ▼
FRONTEND — Angular SPA (MVC moderno)
┌──────────────────────────────────────────────┐
│  Model (interfaces TypeScript)               │
│   Employee  |  Transport  |  Trip            │
│                                              │
│  Controller (servicios @Injectable)          │
│   AuthService  →  /oauth, /employees         │
│   EmployeeService  →  CRUD + estado reactivo │
│   TransportService  →  CRUD + estado reactivo│
│   TripService  →  CRUD + estado reactivo     │
│                                              │
│  View (componentes standalone + templates)   │
│   EmployeeListComponent                      │
│   TransportListComponent                     │
│   TripsListComponent                         │
│   TableComponent  (genérico/reutilizable)    │
│   AdminLayout  |  DriverLayout               │
│                                              │
│  Router Angular  (dispatch por URL)          │
│   /app/admin/employee  → EmployeeList        │
│   /app/admin/transport → TransportList       │
│   /app/admin/trips     → TripsList           │
└──────────────────────────────────────────────┘
```

### Archivos relevantes

#### 1. Modelo — `EmployeesEntity`
**Ruta:** `backend/sgt-backend/module/employees/src/V1/Rest/Employees/EmployeesEntity.php`

Entidad de dominio del módulo `employees`. Extiende `ArrayObject` de PHP para representar un registro individual de empleado serializable a HAL+JSON.

```php
// Líneas 1-8
namespace employees\V1\Rest\Employees;
use ArrayObject;

class EmployeesEntity extends ArrayObject {}
```

#### 2. Modelo — `EmployeesCollection`
**Ruta:** `backend/sgt-backend/module/employees/src/V1/Rest/Employees/EmployeesCollection.php`

Colección paginada de entidades. Extiende `Laminas\Paginator\Paginator`, lo que habilita paginación automática en la respuesta REST.

```php
// Líneas 1-8
namespace employees\V1\Rest\Employees;
use Laminas\Paginator\Paginator;

class EmployeesCollection extends Paginator {}
```

#### 3. Controlador backend — `RegisterController`
**Ruta:** `backend/sgt-backend/module/employees/src/V1/Rpc/Register/RegisterController.php`

Controlador RPC que gestiona el registro de nuevos empleados. Recibe el request HTTP, valida los campos, hashea la contraseña y ejecuta las inserciones en la base de datos (líneas 18–49).

```php
// Líneas 18-49
public function registerAction()
{
    $data = $this->getRequest()->getContent();
    $body = json_decode($data, true);

    // ... validación de campos ...

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
```

#### 4. Rutas backend — `module.config.php`
**Ruta:** `backend/sgt-backend/module/employees/config/module.config.php`

Define las rutas REST (`/employees[/:employees_id]`) y RPC (`/register`). Mapea cada segmento de URL a su controlador correspondiente (líneas 5–24).

```php
// Líneas 5-24
'employees.rest.employees' => [
    'type' => 'Segment',
    'options' => [
        'route'    => '/employees[/:employees_id]',
        'defaults' => ['controller' => 'employees\\V1\\Rest\\Employees\\Controller'],
    ],
],
'employees.rpc.register' => [
    'type' => 'Segment',
    'options' => [
        'route'    => '/register',
        'defaults' => [
            'controller' => 'employees\\V1\\Rpc\\Register\\Controller',
            'action'     => 'register',
        ],
    ],
],
```

#### 5. Modelos TypeScript — interfaces de dominio
**Rutas:**
- `Front V3/Front V3/src/app/features/employes/models/employee.ts`
- `Front V3/Front V3/src/app/features/transport/models/transport.ts`
- `Front V3/Front V3/src/app/features/trips/models/trips.ts`

Interfaces que definen la forma de cada entidad en el frontend, actuando como contrato entre la Vista y el Controlador (servicio).

```ts
// employee.ts
export interface Employee {
  id_employee: number;
  name: string;
  salary: number;
  position?: string;
}

// trips.ts
export interface Trip {
  id_trip: number;
  id_transport: number;
  id_employee: number;
  id_route: number;
  income: number;
  fuelcost: number;
  date: string;
}
```

#### 6. Controlador frontend — `EmployeeService`
**Ruta:** `Front V3/Front V3/src/app/features/employes/services/employes.ts`

Servicio Angular (`@Injectable`) que encapsula la lógica de negocio de empleados: CRUD, estado reactivo con `BehaviorSubject` y exposición de un `Observable` a los componentes Vista (líneas 1–60).

```ts
// Líneas 1-16
@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private data: Employee[] = [];
  private dataSubject = new BehaviorSubject<Employee[]>(this.data);
  data$: Observable<Employee[]> = this.dataSubject.asObservable();

  getAll(): Observable<Employee[]> { return this.data$; }
  getById(id: number): Employee | undefined {
    return this.data.find(e => e.id_employee === id);
  }
  // create / update / delete ...
}
```

#### 7. Vista — `EmployeeListComponent`
**Ruta:** `Front V3/Front V3/src/app/features/employes/pages/employes-list/employes-list.ts`

Componente standalone que representa la Vista de lista. Inyecta `EmployeeService`, se suscribe al Observable en `ngOnInit` y delega la renderización al componente genérico `<app-table>` (líneas 1–88).

```ts
// Líneas 10-25
@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableComponent],
  templateUrl: './employes-list.html',
})
export class EmployeeListComponent implements OnInit {
  private service = inject(EmployeeService);
  Employes: Employee[] = [];

  ngOnInit() {
    this.service.getAll().subscribe(data => { this.Employes = data; });
  }
}
```

#### 8. Vista compartida — `TableComponent`
**Ruta:** `Front V3/Front V3/src/app/shared/components/table/table.ts`

Componente genérico reutilizable que actúa como Vista de tabla para cualquier entidad. Acepta `data` y `columns` como `@Input` y emite eventos de acción (`view`, `edit`, `delete`, `qr`) hacia el componente padre (líneas 1–26).

#### 9. Router Angular — `app.routes.ts`
**Ruta:** `Front V3/Front V3/src/app/app.routes.ts`

Equivalente al Front Controller de MVC clásico. Mapea cada URL a su componente mediante lazy loading y protege las rutas con `authGuard` según el rol del usuario (líneas 1–87).

```ts
// Líneas 23-35
{
  path: 'admin', component: AdminLayout,
  canActivate: [authGuard],
  data: { role: 'admin' },
  children: [
    { path: 'employee', loadChildren: () =>
        import('./features/employes/employee-routes').then(m => m.EMPLOYEE_ROUTES) },
    { path: 'trips', loadChildren: () =>
        import('./features/trips/trips-routes').then(m => m.TRIPS_ROUTES) },
  ]
}
```

#### 10. Configuración de la aplicación — `app.config.ts`
**Ruta:** `Front V3/Front V3/src/app/app.config.ts`

Punto de arranque del frontend. Registra el router y el cliente HTTP con el interceptor de autenticación, que adjunta el Bearer token en cada petición a la API (líneas 1–15).

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

### Flujo de uso

1. El usuario abre la aplicación; Angular Router evalúa la URL y redirige a `/app/login` si no hay token válido.
2. El usuario introduce credenciales; `AuthService.login()` envía `POST /oauth` al backend Laminas.
3. El backend valida las credenciales contra `oauth_users` en Supabase y devuelve un token OAuth2.
4. `AuthService` guarda el token en `localStorage`; el `authInterceptor` lo incluirá en todas las peticiones posteriores.
5. Angular Router dirige al usuario al layout correspondiente (`AdminLayout` o `DriverLayout`) según el rol codificado en el token.
6. Al navegar a `/app/admin/employee`, el Router hace lazy load de `EmployeeListComponent` (Vista).
7. `EmployeeListComponent` inyecta `EmployeeService` (Control) y se suscribe a `data$`.
8. El servicio solicita los datos a `GET /employees`; el backend Laminas despacha la petición al `EmployeesResourceController`, consulta la base de datos y devuelve la colección como HAL+JSON.
9. El servicio actualiza el `BehaviorSubject`; el componente Vista recibe el array y lo pasa al `<app-table>` genérico para su renderizado.
10. El usuario puede crear, editar o eliminar registros; cada acción fluye Vista → Servicio (Control) → API REST → Modelo (BD), manteniendo la separación de responsabilidades del patrón MVC.

---

## Especificación 3 — Generación de Códigos QR

> **Requisito:** Generar códigos QR para el producto o servicio, disponible a través de una API. *(5 pts)*

### Cumplimiento

El sistema genera un código QR único por cada viaje registrado. El QR codifica la URL del endpoint REST del backend correspondiente al viaje (`http://localhost:8080/trips/{id_trip}`), de modo que al escanearlo se accede directamente al recurso del viaje a través de la API.

### Tecnología utilizada

| Paquete          | Versión  | Rol                                                                 |
|------------------|----------|---------------------------------------------------------------------|
| `qrcode`         | ^1.5.4   | Generación del QR en formato Data URL (PNG base64) en el cliente    |
| `@types/qrcode`  | ^1.5.6   | Definiciones de tipos TypeScript para `qrcode`                      |

La generación se realiza **en el frontend** mediante importación dinámica (`import('qrcode')`), lo que evita incluir la librería en el bundle principal y la carga solo cuando el usuario la necesita.

### Implementación

#### 1. `QrService` — Servicio de generación
**Ruta:** `Front V3/Front V3/src/app/core/services/qr.service.ts`

Servicio Angular inyectable que encapsula toda la lógica de generación. Usa importación dinámica de `qrcode` y devuelve una promesa con el Data URL (imagen PNG en base64).

```ts
async generateTripQr(tripId: number): Promise<string> {
  const QRCode = await import('qrcode');
  const url = `${this.API_BASE}/trips/${tripId}`;
  return QRCode.toDataURL(url, { width: 256, margin: 2 });
}
```

#### 2. `QrModalComponent` — Componente de presentación
**Ruta:** `Front V3/Front V3/src/app/shared/components/qr-modal/`

Componente standalone reutilizable que recibe el viaje como `@Input()`, llama al servicio en `ngOnInit`, y muestra el QR generado como imagen. Gestiona tres estados visuales: *cargando*, *error* y *QR listo*. Incluye un botón para **descargar el QR como archivo PNG** (`viaje-{id}-qr.png`).

Archivos del componente:
- `qr-modal.ts` — lógica del componente (líneas 23–35: generación; líneas 38–44: descarga)
- `qr-modal.html` — template con los tres estados y el botón de descarga
- `qr-modal.css` — estilos del modal overlay

#### 3. `TripsListComponent` — Vista de lista de viajes
**Ruta:** `Front V3/Front V3/src/app/features/trips/pages/trips-list/trips-list.ts`

Orquesta la apertura del modal. Mantiene el estado `showQrModal` y `selectedTrip` (líneas 137–148). El template (`trips-list.html`) renderiza `<app-qr-modal>` condicionalmente cuando el usuario pulsa el botón QR de cualquier fila (líneas 27–29 del HTML).

#### 4. `TableComponent` — Tabla genérica compartida
**Ruta:** `Front V3/Front V3/src/app/shared/components/table/`

Componente de tabla reutilizable que expone el `@Output() qr = new EventEmitter<any>()` y renderiza el botón **QR** en la columna de acciones de cada fila (`table.html`, línea 22). Al hacer clic emite el evento con el viaje correspondiente hacia `TripsListComponent`.

#### 5. `TripsDetailComponent` — Vista de detalle de viaje
**Ruta:** `Front V3/Front V3/src/app/features/trips/pages/trips-detail/trips-detail.ts`

También consume `QrService` directamente (líneas 41–43) para mostrar el QR del viaje dentro de la vista de detalle, sin necesidad del modal.

### Flujo de uso

1. El usuario navega a **Viajes** (`/trips`).
2. En la tabla, cada fila tiene el botón **QR**.
3. Al pulsarlo, `TableComponent` emite el evento `qr` con los datos del viaje.
4. `TripsListComponent` recibe el evento, guarda el viaje seleccionado y activa `showQrModal = true`.
5. Se renderiza `<app-qr-modal>`, que en su `ngOnInit` llama a `QrService.generateTripQr(id_trip)`.
6. `QrService` importa dinámicamente `qrcode`, construye la URL `http://localhost:8080/trips/{id}` y devuelve el Data URL del QR.
7. El modal muestra el QR como imagen y ofrece descargarlo como PNG.
8. En la vista de detalle del viaje, el QR se genera automáticamente al cargar la página.


# Diagrama de base de datos alojada en supabase

```mermaid
erDiagram
  oauth_users {
    varchar username PK
    varchar password
    varchar first_name
    varchar last_name
    varchar email
    boolean email_verified
    varchar scope
  }
  oauth_clients {
    varchar client_id PK
    varchar client_secret
    varchar redirect_uri
    varchar grant_types
    varchar scope
    varchar user_id
  }
  oauth_access_tokens {
    varchar access_token PK
    varchar client_id
    varchar user_id
    timestamp expires
    varchar scope
  }
  oauth_authorization_codes {
    varchar authorization_code PK
    varchar client_id
    varchar user_id
    varchar redirect_uri
    timestamp expires
    varchar scope
  }
  oauth_refresh_tokens {
    varchar refresh_token PK
    varchar client_id
    varchar user_id
    timestamp expires
    varchar scope
  }
  oauth_jwt {
    varchar client_id
    varchar subject
    varchar public_key
  }
  oauth_scopes {
    varchar scope PK
    boolean is_default
  }
  employees {
    int id_employee PK
    varchar name
    numeric salary
    text role
    varchar username FK
  }
  transport {
    int id_transport PK
    varchar name
    varchar type
    varchar plate
    varchar status
    numeric costperkm
    numeric maintenancecost
    numeric fuelconsumption
  }
  route {
    int id_route PK
    varchar origin
    varchar destine
    numeric distance
  }
  trip {
    int id_trip PK
    int id_transport FK
    int id_employee FK
    int id_route FK
    numeric income
    numeric fuelcost
    date date
  }

  oauth_users ||--o{ employees : "username"
  employees ||--o{ trip : "id_employee"
  transport ||--o{ trip : "id_transport"
  route ||--o{ trip : "id_route"
```

---

## Requisitos previos

- **Node.js** >= 18 y **npm** >= 10
- **PHP** >= 8.1 con extensiones: `pdo`, `pdo_pgsql`, `mbstring`, `json`
- **Composer** (gestor de paquetes PHP)
- Acceso a la base de datos en **Supabase** (credenciales en `config/autoload/`)

---

## Estructura de carpetas

```
Proyecto_SGT-por-Angular/
├── Front V3/
│   └── Front V3/                        # Aplicación Angular
│       ├── src/
│       │   └── app/
│       │       ├── core/                # Lógica central reutilizable
│       │       │   ├── guards/          # auth.guard.ts — protección de rutas
│       │       │   ├── interceptors/    # auth.interceptor.ts — adjunta el token JWT
│       │       │   └── services/        # auth, nav, qr, report services
│       │       └── features/            # Módulos funcionales por dominio
│       │           ├── auth/            # Login (flujo OAuth2)
│       │           ├── dashboard/       # Página principal con métricas
│       │           ├── employes/        # CRUD de empleados
│       │           │   ├── components/  # employee-form
│       │           │   ├── models/      # employee.ts
│       │           │   ├── pages/       # employes-list, employee-detail
│       │           │   └── services/    # employes.ts
│       │           ├── transport/       # CRUD de vehículos
│       │           │   ├── components/  # transport-form
│       │           │   ├── models/      # transport.ts
│       │           │   ├── pages/       # transport-list, transport-detail
│       │           │   └── services/    # transport.ts
│       │           ├── trips/           # CRUD de viajes
│       │           │   ├── components/  # trips-form
│       │           │   ├── models/      # trips.ts
│       │           │   ├── pages/       # trips-list, trips-detail
│       │           │   └── services/    # trips.ts
│       │           └── logistics/       # Dashboard logístico
│       │               ├── models/      # logistics.ts
│       │               ├── pages/       # logistics-dashboard
│       │               └── services/    # logistics.ts
│       ├── angular.json
│       ├── package.json
│       └── tsconfig.json
│
└── backend/
    └── sgt-backend/                     # API REST con Laminas API Tools
        ├── config/
        │   └── autoload/                # Configuración de DB, OAuth2, CORS
        ├── module/
        │   ├── Application/             # Módulo base de Laminas MVC
        │   └── employees/               # Módulo principal del negocio
        │       └── src/V1/
        │           ├── Rest/
        │           │   ├── Employees/   # Recurso REST de empleados
        │           │   ├── Transport/   # Recurso REST de transporte
        │           │   └── Trips/       # Recurso REST de viajes
        │           └── Rpc/
        │               ├── Register/    # Endpoint de registro de usuarios
        │               └── Logistics/   # Endpoint de reportes logísticos
        ├── public/
        │   └── index.php                # Punto de entrada del backend
        └── vendor/                      # Dependencias PHP (Composer)
```

---

## Instrucciones de instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Shadowboss1214/Proyecto_SGT-por-Angular.git
cd Proyecto_SGT-por-Angular
```

---

### 2. Instalar el Frontend (Angular)

```bash
cd "Front V3/Front V3"
npm install
npm install qrcode
npm install --save-dev @types/qrcode
```

Levantar el servidor de desarrollo:

```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200`

---

### 3. Instalar el Backend (Laminas)

```bash
cd backend/sgt-backend
composer install
```

Levantar el servidor PHP:

```bash
php -S localhost:8080 -t public
```

La API estará disponible en `http://localhost:8080`

> **Nota:** El frontend hace peticiones al backend en `http://localhost:8080`. Asegúrate de que ambos estén corriendo al mismo tiempo.

---

### 4. Configurar la base de datos

Las credenciales de conexión a Supabase se encuentran en:

```
backend/sgt-backend/config/autoload/
```

Este directorio **no se sube a GitHub** por seguridad (está en `.gitignore`). Cada integrante del equipo debe configurar sus propias credenciales localmente.

---

## Endpoints del API

Base URL: `http://localhost:8080`

Todos los endpoints (excepto `/register`) requieren el header:
```
Authorization: Bearer <token>
```

### Autenticación

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/oauth` | Obtener token de acceso (OAuth2) |
| `POST` | `/register` | Registrar nuevo usuario |

### Empleados

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/employees` | Listar todos los empleados |
| `GET` | `/employees/:employee_id` | Obtener un empleado por ID |
| `POST` | `/employees` | Crear un nuevo empleado |
| `PUT` | `/employees/:employee_id` | Actualizar un empleado |
| `DELETE` | `/employees/:employee_id` | Eliminar un empleado |

### Transporte

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/transport` | Listar todos los vehículos |
| `GET` | `/transport/:transport_id` | Obtener un vehículo por ID |
| `POST` | `/transport` | Registrar un nuevo vehículo |
| `PUT` | `/transport/:transport_id` | Actualizar un vehículo |
| `DELETE` | `/transport/:transport_id` | Eliminar un vehículo |

### Viajes

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/trips` | Listar todos los viajes |
| `GET` | `/trips/:id_trip` | Obtener un viaje por ID |
| `POST` | `/trips` | Registrar un nuevo viaje |
| `PUT` | `/trips/:id_trip` | Actualizar un viaje |
| `DELETE` | `/trips/:id_trip` | Eliminar un viaje |

### Logística

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/logistics` | Obtener datos del dashboard logístico |

---


