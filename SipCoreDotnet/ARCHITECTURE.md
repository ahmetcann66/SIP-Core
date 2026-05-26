# SipCore.DotNet Architecture

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SipCore.Mobile (MAUI Desktop Application)               │   │
│  │  - UI: XAML with data binding                            │   │
│  │  - ViewModel: EnglishHubViewModel (MVVM pattern)         │   │
│  │  - HttpClient: REST communication                        │   │
│  │  - Target: Windows 10 (net8.0-windows)                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│                        HTTP/HTTPS                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       API LAYER (ASP.NET Core)                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SipCore.Api (REST API Server)                           │   │
│  │  Port: localhost:5099                                    │   │
│  │  - Controllers: EnglishHubController                     │   │
│  │  - Services: EnglishHubStateService                      │   │
│  │  - Middleware: ExceptionHandlingMiddleware              │   │
│  │  - CORS: AllowAll policy                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SipCore.Core (Domain Models & DTOs)                     │   │
│  │  - Models: Student, Teacher, StudyHistory               │   │
│  │  - Entities: EnglishHubState (BaseEntity)               │   │
│  │  - DTOs: EnglishHubStateDto, WordItemDto                │   │
│  │  - Interfaces: IRepository, IService                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PERSISTENCE LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SipCore.Data (EF Core & Repositories)                   │   │
│  │  - DbContext: AppDbContext                               │   │
│  │  - Repositories: Generic + Specialized                   │   │
│  │  - Migrations: Schema management                         │   │
│  │  - Provider: Pomelo MySQL                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  MySQL 8.0.36                                            │   │
│  │  Host: localhost:3306                                    │   │
│  │  Database: sip_core_db                                   │   │
│  │  Tables: students, teachers, study_histories,           │   │
│  │          english_hub_states                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Diagram

```
┌────────────────────────────┐
│  SipCore.Mobile (MAUI)     │
│  ┌────────────────────┐    │
│  │ EnglishHubViewModel├────┼──── INotifyPropertyChanged
│  │ - LoadStateAsync() │    │
│  │ - PopulateItems()  │    │
│  └──────────┬─────────┘    │
│             │              │
│             ↓              │
│  ┌────────────────────┐    │
│  │  IApiClient        │    │
│  │  ApiClient impl    │    │
│  └────────────────────┘    │
└────────────┬───────────────┘
             │
       HTTP GET/PUT
             │
             ↓
    ┌──────────────────────────────┐
    │  SipCore.Api (ASP.NET Core)  │
    │                              │
    │  ┌────────────────────────┐  │
    │  │ EnglishHubController   │  │
    │  │ GET /api/english-hub.. │  │
    │  │ PUT /api/english-hub.. │  │
    │  └────────────┬───────────┘  │
    │               │               │
    │               ↓               │
    │  ┌────────────────────────┐  │
    │  │ IEnglishHubState       │  │
    │  │ Service (impl)         │  │
    │  │ - LoadStateAsync()     │  │
    │  │ - SaveStateAsync()     │  │
    │  └────────────┬───────────┘  │
    │               │               │
    │               ↓               │
    │  ┌────────────────────────┐  │
    │  │ IEnglishHubState       │  │
    │  │ Repository (impl)      │  │
    │  │ - GetByStateKeyAsync() │  │
    │  │ - SaveAsync()          │  │
    │  └────────────┬───────────┘  │
    │               │               │
    │               ↓               │
    │  ┌────────────────────────┐  │
    │  │ AppDbContext (EF Core) │  │
    │  │ Pomelo MySQL Provider  │  │
    │  └────────────────────────┘  │
    └──────────────┬────────────────┘
                   │
                   ↓
          MySQL Database
```

---

## Class Hierarchy (Inheritance)

```
┌─────────────────────┐
│   BaseEntity        │
│  (SipCore.Core)     │
│  ┌───────────────┐  │
│  │ Id: int       │  │
│  │ CreatedAt     │  │
│  │ UpdatedAt     │  │
│  └───────────────┘  │
└──────────┬──────────┘
           │
    ┌──────┼──────┬──────────────┐
    │      │      │              │
    ↓      ↓      ↓              ↓
┌────────┐┌───────┐┌──────────┐┌─────────────────┐
│Student ││Teacher││StudyHist ││EnglishHubState │
│        ││       ││ory       ││                 │
│- Name  ││- Name ││- Student ││- StateKey       │
│- Email ││- Email││- Notes   ││- PayloadJson    │
└────────┘└───────┘└──────────┘└─────────────────┘
```

---

## Generic Repository Pattern

```
┌────────────────────────────┐
│  IRepository<T>            │
│  (SipCore.Data)            │
│  ┌──────────────────────┐  │
│  │ GetAsync(id)         │  │
│  │ GetAllAsync()        │  │
│  │ SaveAsync(entity)    │  │
│  │ DeleteAsync(id)      │  │
│  └──────────────────────┘  │
└────────────┬───────────────┘
             │
             │ (implements)
             │
    ┌────────┴──────────────────────────┐
    │                                   │
    ↓                                   ↓
┌──────────────────────┐      ┌────────────────────────────┐
│  Repository<T>       │      │ IEnglishHubStateRepository │
│  (Generic impl)      │      │ extends IRepository<T>     │
│  ┌────────────────┐  │      │ ┌────────────────────────┐ │
│  │ DbContext _db  │  │      │ │ GetByStateKeyAsync()   │ │
│  │ SaveAsync()    │  │      │ └────────────────────────┘ │
│  │ GetAsync()     │  │      └────────────┬────────────────┘
│  │ GetAllAsync()  │  │                   │
│  │ DeleteAsync()  │  │                   │ (implements)
│  └────────────────┘  │                   │
└──────────────────────┘    ┌──────────────┴─────────┐
                            │                        │
                            ↓                        ↓
                   ┌──────────────────┐
                   │ EnglishHubState  │
                   │ Repository       │
                   │ (specialized)    │
                   └──────────────────┘
```

---

## Dependency Injection Container

```
SipCore.Api/Program.cs:
┌────────────────────────────────────┐
│ DI Registration                     │
├────────────────────────────────────┤
│ DbContext:                          │
│  - Scoped<AppDbContext>            │
│  - MySQL connection string         │
│                                    │
│ Repositories:                       │
│  - Scoped<IRepository<T>,          │
│    Repository<T>>                  │
│  - Scoped<                         │
│    IEnglishHubStateRepository,     │
│    EnglishHubStateRepository>      │
│                                    │
│ Services:                           │
│  - Scoped<                         │
│    IEnglishHubStateService,        │
│    EnglishHubStateService>         │
│                                    │
│ CORS:                               │
│  - AllowAll policy                 │
│                                    │
│ Controllers:                        │
│  - AutoReg<EnglishHubController>   │
└────────────────────────────────────┘

SipCore.Mobile/MauiProgram.cs:
┌────────────────────────────────────┐
│ MAUI DI Registration               │
├────────────────────────────────────┤
│ HttpClient:                         │
│  - AddHttpClient<IApiClient,       │
│    ApiClient>                      │
│  - BaseAddress: localhost:5099     │
│                                    │
│ ViewModels:                         │
│  - Scoped<                         │
│    EnglishHubViewModel>            │
│                                    │
│ Services:                           │
│  - SetApiClient(instance)          │
└────────────────────────────────────┘
```

---

## Data Flow: Load State

```
1. User clicks "Load" button on Mobile UI
   ↓
2. EnglishHubViewModel.LoadStateAsync()
   ↓
3. ApiClient.GetAsync<EnglishHubStateDto>("/state")
   ↓
4. HTTP GET to http://localhost:5099/api/english-hub/state
   ↓
5. EnglishHubController.GetState()
   ↓
6. IEnglishHubStateService.LoadStateAsync()
   ↓
7. IEnglishHubStateRepository.GetByStateKeyAsync("WORDS")
   ↓
8. EF Core query to MySQL:
   SELECT * FROM english_hub_states WHERE state_key = 'WORDS'
   ↓
9. EnglishHubState entity returned with PayloadJson
   ↓
10. Service deserializes PayloadJson to DTO
    ↓
11. DTO serialized to JSON response
    ↓
12. Mobile receives JSON, binds to ObservableCollection<WordItemDisplay>
    ↓
13. UI renders vocabulary items in CollectionView
```

---

## Data Flow: Save State

```
1. User modifies vocabulary state on Mobile
   ↓
2. EnglishHubViewModel.SaveStateCommand.Execute()
   ↓
3. ApiClient.PutAsync<EnglishHubStateDto>("/state", dto)
   ↓
4. HTTP PUT to http://localhost:5099/api/english-hub/state
   ↓
5. EnglishHubController.SaveState(EnglishHubStateDto dto)
   ↓
6. IEnglishHubStateService.SaveStateAsync(dto)
   ↓
7. Service serializes DTO.Words to PayloadJson string
   ↓
8. IEnglishHubStateRepository.SaveAsync(EnglishHubState entity)
   ↓
9. Repository detects if INSERT or UPDATE:
   - If Id == 0: INSERT new row
   - If Id > 0: UPDATE existing row
   ↓
10. EF Core DbContext.SaveChangesAsync()
    ↓
11. MySQL executes INSERT or UPDATE statement
    ↓
12. Updated entity with new Id/Timestamp returned
    ↓
13. DTO returned to Controller
    ↓
14. HTTP 200 OK with updated DTO JSON
    ↓
15. Mobile receives response, updates UI
```

---

## Exception Handling Flow

```
┌──────────────────────────────────────────┐
│  HTTP Request to API                     │
└──────────────────┬───────────────────────┘
                   │
                   ↓
   ┌──────────────────────────────────┐
   │ ExceptionHandlingMiddleware      │
   │ (Global catch-all)               │
   └──────────────────┬───────────────┘
                      │
                      ↓
   ┌──────────────────────────────────┐
   │ Try: await _next(context)        │
   └──────────────────┬───────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
       NO ERROR   EXCEPTION      SUCCESS
        │             │             │
        ↓             ↓             ↓
      ✓ OK      HandleException   ✓ OK
                      │
                      ↓
               ┌──────────────────┐
               │ Log Exception    │
               │ Create Response  │
               │ - Status Code    │
               │ - ProblemDetails │
               │ - Error Message  │
               └──────────────────┘
                      │
                      ↓
              HTTP Response to Client
```

---

## Testing Architecture

```
┌─────────────────────────────────────┐
│  SipCore.Tests (xUnit + Moq)        │
├─────────────────────────────────────┤
│                                     │
│  Layer 1: Service Tests (5)         │
│  ┌─────────────────────────────┐    │
│  │ LoadStateAsync tests        │    │
│  │ SaveStateAsync tests        │    │
│  │ Mocks: IRepository<>        │    │
│  └─────────────────────────────┘    │
│           ↓                          │
│  Layer 2: Repository Tests (4)      │
│  ┌─────────────────────────────┐    │
│  │ InMemory EF Core DbContext  │    │
│  │ SaveAsync tests             │    │
│  │ GetByStateKeyAsync tests    │    │
│  └─────────────────────────────┘    │
│           ↓                          │
│  Layer 3: Controller Tests (4)      │
│  ┌─────────────────────────────┐    │
│  │ GetState endpoint tests     │    │
│  │ SaveState endpoint tests    │    │
│  │ Mocks: IService            │    │
│  └─────────────────────────────┘    │
│           ↓                          │
│  RESULT: 13/13 Tests Passing ✅     │
└─────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | .NET MAUI (XAML) | .NET 8.0 |
| **Backend** | ASP.NET Core | 8.0.5 |
| **ORM** | Entity Framework Core | 8.0.5 |
| **DB Provider** | Pomelo.EntityFrameworkCore.MySql | 8.0.2 |
| **Database** | MySQL | 8.0.36 |
| **Testing** | xUnit | 2.8.1 |
| **Mocking** | Moq | 4.20.72 |
| **Static Analysis** | StyleCop.Analyzers | 1.1.118 |
| **HTTP Client** | System.Net.Http | Built-in |
| **JSON** | System.Text.Json | Built-in |

---

## Deployment Topology

```
┌─────────────────────────────────────────────────┐
│  Developer Machine / Test Environment          │
│                                                 │
│  ┌──────────────────┐      ┌────────────────┐  │
│  │ SipCore.Mobile   │      │ SipCore.Api    │  │
│  │ (MAUI Exe)       │◄────►│ (Kestrel)      │  │
│  │ Port: 5000       │      │ Port: 5099     │  │
│  └──────────────────┘      └────────┬───────┘  │
│                                     │          │
│                                     ↓          │
│                            ┌────────────────┐  │
│                            │ MySQL Server   │  │
│                            │ Port: 3306     │  │
│                            │ DB: sip_core_db│  │
│                            └────────────────┘  │
└─────────────────────────────────────────────────┘

Future Production Topology:
┌─────────────────────────────────────────────────┐
│ Azure Container Apps / App Service             │
│                                                 │
│  ┌──────────────────┐      ┌────────────────┐  │
│  │ SipCore.Api      │      │ Azure SQL      │  │
│  │ (Docker)         │◄────►│ (MySQL Compat.)│  │
│  │ Replicas: N      │      │ Managed        │  │
│  └──────────────────┘      └────────────────┘  │
│                                                 │
│  ┌──────────────────┐                          │
│  │ Application      │                          │
│  │ Insights         │                          │
│  │ (Monitoring)     │                          │
│  └──────────────────┘                          │
└─────────────────────────────────────────────────┘
```

---

## Key Design Patterns

1. **Repository Pattern**: Abstraction over data access
2. **Generic Patterns**: `IRepository<T>` for reusability
3. **Dependency Injection**: Loose coupling via interfaces
4. **MVVM**: Mobile UI with data binding
5. **Async/Await**: Non-blocking I/O throughout
6. **Middleware**: Cross-cutting concerns (exceptions)
7. **Service Locator**: Static ServiceHelper for MAUI
8. **Factory Pattern**: DI container creates instances
9. **Decorator Pattern**: Middleware wraps request pipeline
10. **Strategy Pattern**: Interface-based algorithm selection
