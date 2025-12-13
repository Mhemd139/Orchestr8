# Visual Documentation & Diagrams

This document contains various diagrams and visual representations of the Shadow Worker system for presentations, documentation, and understanding the architecture.

---

## System Overview Diagrams

### Simplified System Flow

```mermaid
graph LR
    A[👤 User] -->|1. Record| B[📹 Capture System]
    B -->|2. Events| C[🧠 AI Engine<br/>Nova Pro]
    C -->|3. Workflow| D[📋 Workflow Store]
    D -->|4. Execute| E[⚡ Automation]
    E -->|5. Result| A

    style C fill:#FF9900,stroke:#232F3E,stroke-width:3px,color:#fff
    style B fill:#61DAFB,stroke:#20232A,stroke-width:2px
    style D fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
```

### Technology Stack Visualization

```mermaid
graph TB
    subgraph "Presentation Layer"
        A1[React 18.3]
        A2[TypeScript 5.8]
        A3[Tailwind CSS]
        A4[shadcn-ui]
    end

    subgraph "Application Layer"
        B1[FastAPI]
        B2[Pydantic v2]
        B3[Uvicorn]
    end

    subgraph "AI/ML Layer"
        C1[AWS Bedrock]
        C2[Amazon Nova Pro]
        C3[Prompt Engineering]
    end

    subgraph "Data Layer"
        D1[Session Storage]
        D2[Workflow Store]
        D3[S3 Screenshots]
    end

    A1 --> B1
    A2 --> B1
    B1 --> B2
    B1 --> B3
    B2 --> C1
    C1 --> C2
    C3 --> C2
    B1 --> D1
    B1 --> D2
    C1 --> D3

    style C2 fill:#FF9900,stroke:#232F3E,stroke-width:3px,color:#fff
```

---

## AI/ML Pipeline Diagrams

### Multimodal Processing Flow

```mermaid
flowchart TD
    START([User Recording]) --> CAPTURE[Capture Events + Screenshots]

    CAPTURE --> TEXT[Text Data<br/>Events & Metadata]
    CAPTURE --> VISION[Visual Data<br/>Screenshots]

    TEXT --> PROMPT[Prompt Engineering]
    VISION --> ENCODE[Base64 Encoding]

    PROMPT --> COMBINE[Combine Multimodal Input]
    ENCODE --> COMBINE

    COMBINE --> BEDROCK[AWS Bedrock API]
    BEDROCK --> NOVA[Amazon Nova Pro<br/>Multimodal LLM]

    NOVA --> ANALYZE[Semantic Analysis]
    ANALYZE --> OPTIMIZE[Workflow Optimization]
    OPTIMIZE --> VALIDATE[JSON Validation]
    VALIDATE --> OUTPUT([Workflow Definition])

    style NOVA fill:#FF9900,stroke:#232F3E,stroke-width:3px,color:#fff
    style ANALYZE fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
```

### Prompt Engineering Architecture

```mermaid
graph TB
    subgraph "Input Components"
        A[System Prompt<br/>Rules & Schema]
        B[User Timeline<br/>Event Sequence]
        C[Few-Shot Examples<br/>Training Data]
        D[Screenshots<br/>Visual Context]
    end

    subgraph "Prompt Assembly"
        E[Template Engine]
        F[Context Builder]
        G[Token Optimizer]
    end

    subgraph "Model Interaction"
        H[AWS Bedrock]
        I[Nova Pro v1]
    end

    subgraph "Output Processing"
        J[JSON Parser]
        K[Schema Validator]
        L[Error Handler]
    end

    A --> E
    B --> F
    C --> E
    D --> F

    E --> G
    F --> G
    G --> H
    H --> I

    I --> J
    J --> K
    K --> L
    L --> M[Workflow Definition]

    style I fill:#FF9900,stroke:#232F3E,stroke-width:3px,color:#fff
```

---

## Data Model Relationships

### Core Data Models

```mermaid
classDiagram
    class EventLog {
        +String event_type
        +DateTime timestamp
        +Dict details
        +String screenshot_path
        +Dict element_metadata
    }

    class SessionTimeline {
        +String session_id
        +String application_name
        +DateTime start_time
        +DateTime end_time
        +List~EventLog~ events
        +Dict metadata
    }

    class WorkflowStep {
        +int step_number
        +String action
        +Selector selector
        +Dict parameters
        +String description
        +int estimated_duration_ms
    }

    class WorkflowDefinition {
        +String workflow_name
        +String description
        +List~WorkflowStep~ steps
        +Dict metadata
        +DateTime created_at
    }

    class Selector {
        +String type
        +String value
        +Dict fallback_coordinates
        +int fallback_index
    }

    SessionTimeline "1" --> "*" EventLog
    WorkflowDefinition "1" --> "*" WorkflowStep
    WorkflowStep "1" --> "0..1" Selector
```

### State Machine for Workflow Execution

```mermaid
stateDiagram-v2
    [*] --> Idle

    Idle --> Preparing: Start Execution
    Preparing --> Running: Validation Passed
    Preparing --> Failed: Validation Failed

    Running --> ExecutingStep: Next Step
    ExecutingStep --> StepSuccess: Action Completed
    ExecutingStep --> StepFallback: Primary Failed

    StepSuccess --> Running: More Steps
    StepSuccess --> Completed: Last Step

    StepFallback --> StepSuccess: Fallback Worked
    StepFallback --> StepFailed: All Failed

    StepFailed --> Retrying: Retry Available
    StepFailed --> Failed: No Retries

    Retrying --> ExecutingStep: Retry Attempt

    Completed --> [*]
    Failed --> [*]

    note right of ExecutingStep
        Try selectors in order:
        1. Text-based
        2. Coordinate fallback
        3. Index fallback
    end note
```

---

## Frontend Architecture

### Component Hierarchy

```mermaid
graph TB
    APP[App]

    APP --> HOME[HomePage]
    APP --> TEACH[TeachPage]
    APP --> RUN[RunPage]
    APP --> SETTINGS[SettingsPage]

    TEACH --> T1[RecordingControls]
    TEACH --> T2[EventLog]
    TEACH --> T3[RecordingOverview]
    TEACH --> T4[ScreenshotViewer]

    RUN --> R1[WorkflowSelector]
    RUN --> R2[WorkflowExecutor]
    RUN --> R3[ExecutionStatus]
    RUN --> R4[TimelineStrip]

    T1 --> UI[UI Components]
    T2 --> UI
    R1 --> UI
    R2 --> UI

    UI --> BTN[Button]
    UI --> CARD[Card]
    UI --> BADGE[Badge]
    UI --> TOAST[Toast]

    style TEACH fill:#61DAFB,stroke:#20232A,stroke-width:2px
    style RUN fill:#61DAFB,stroke:#20232A,stroke-width:2px
```

### State Management Flow

```mermaid
sequenceDiagram
    participant UI as React Component
    participant Store as React Query
    participant API as API Client
    participant Backend as FastAPI

    UI->>UI: User Action
    UI->>Store: useMutation/useQuery
    Store->>API: HTTP Request
    API->>Backend: REST API Call

    Backend->>Backend: Process Request
    Backend-->>API: Response

    API-->>Store: Data
    Store-->>Store: Update Cache
    Store-->>UI: Trigger Re-render
    UI->>UI: Display Updated UI
```

---

## Backend Architecture

### API Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant Router as FastAPI Router
    participant Middleware as Auth Middleware
    participant Handler as Request Handler
    participant Service as Business Logic
    participant AI as Bedrock Client
    participant DB as Data Store

    Client->>Router: HTTP Request
    Router->>Middleware: Validate Request
    Middleware->>Middleware: Check Auth
    Middleware->>Handler: Forward Request

    Handler->>Service: Call Business Logic
    Service->>AI: Invoke Nova Pro
    AI-->>Service: AI Response
    Service->>DB: Store Result
    DB-->>Service: Confirmation

    Service-->>Handler: Processed Data
    Handler-->>Router: Response
    Router-->>Client: HTTP Response

    Note over AI: Async processing<br/>with timeout handling
```

### Service Layer Architecture

```mermaid
graph TB
    subgraph "API Layer"
        A[FastAPI Routes]
    end

    subgraph "Service Layer"
        B[WorkflowGenerator]
        C[BedrockClient]
        D[ImageProcessor]
        E[FormatConverter]
    end

    subgraph "Repository Layer"
        F[SessionRepository]
        G[WorkflowRepository]
    end

    subgraph "External Services"
        H[AWS Bedrock]
        I[AWS S3]
    end

    A --> B
    A --> E
    B --> C
    B --> D
    B --> F
    B --> G
    C --> H
    D --> I

    style B fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style C fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
```

---

## Workflow Generation Process

### Complete Generation Pipeline

```mermaid
flowchart TD
    START([SessionTimeline Input]) --> VALIDATE{Valid?}

    VALIDATE -->|No| ERROR1[Return Error]
    VALIDATE -->|Yes| SIMPLIFY[Simplify Events]

    SIMPLIFY --> GROUP[Group Typing]
    GROUP --> DETECT[Detect Patterns]
    DETECT --> MERGE[Merge Related Events]

    MERGE --> MODE{Generation Mode}

    MODE -->|AI| PREPARE[Prepare Bedrock Payload]
    MODE -->|Deterministic| RULES[Apply Rules]

    PREPARE --> SCREENSHOTS{Has Screenshots?}
    SCREENSHOTS -->|Yes| ENCODE[Encode Images]
    SCREENSHOTS -->|No| BUILD[Build Prompt]
    ENCODE --> BUILD

    BUILD --> BEDROCK[Call Bedrock]
    BEDROCK --> NOVA[Nova Pro Processing]
    NOVA --> PARSE[Parse Response]

    RULES --> PARSE

    PARSE --> VALID{Valid JSON?}
    VALID -->|No| RETRY{Retry?}
    RETRY -->|Yes| BEDROCK
    RETRY -->|No| ERROR2[Return Error]

    VALID -->|Yes| ENRICH[Enrich Selectors]
    ENRICH --> EXTRACT[Extract Elements]
    EXTRACT --> FALLBACK[Add Fallbacks]
    FALLBACK --> TIMING[Analyze Timing]
    TIMING --> WAITS[Insert Wait Steps]
    WAITS --> DESC[Generate Descriptions]
    DESC --> FINAL{Final Valid?}

    FINAL -->|Yes| SUCCESS([WorkflowDefinition])
    FINAL -->|No| ERROR3[Return Error]

    style NOVA fill:#FF9900,stroke:#232F3E,stroke-width:3px,color:#fff
    style ENRICH fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
```

### Selector Enrichment Strategy

```mermaid
graph TB
    RAW[Raw Workflow<br/>from AI] --> ANALYZE[Analyze Each Step]

    ANALYZE --> TYPE{Action Type}

    TYPE -->|Mouse Action| MOUSE[Extract Element Name]
    TYPE -->|Keyboard Action| KEY[No Selector Needed]

    MOUSE --> TEXT[Create Text Selector]
    TEXT --> COORDS[Add Coordinate Fallback]
    COORDS --> INDEX[Add Index Fallback]

    KEY --> NULL[Set selector = null]

    NULL --> NEXT
    INDEX --> NEXT

    NEXT{More Steps?}
    NEXT -->|Yes| ANALYZE
    NEXT -->|No| OUTPUT[Enriched Workflow]

    style TEXT fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
```

---

## Deployment Architecture

### AWS Infrastructure

```mermaid
graph TB
    subgraph "Edge"
        CF[CloudFront CDN]
        R53[Route 53 DNS]
    end

    subgraph "Application"
        ALB[Application Load Balancer]
        ECS1[ECS Container 1<br/>FastAPI]
        ECS2[ECS Container 2<br/>FastAPI]
        ECS3[ECS Container N<br/>FastAPI]
    end

    subgraph "AI Services"
        BEDROCK[AWS Bedrock<br/>Nova Pro]
    end

    subgraph "Storage"
        S3[S3 Buckets<br/>Screenshots]
        RDS[(RDS PostgreSQL<br/>Workflows)]
    end

    subgraph "Monitoring"
        CW[CloudWatch<br/>Logs & Metrics]
        XR[X-Ray<br/>Tracing]
    end

    R53 --> CF
    CF --> ALB
    ALB --> ECS1
    ALB --> ECS2
    ALB --> ECS3

    ECS1 --> BEDROCK
    ECS2 --> BEDROCK
    ECS3 --> BEDROCK

    ECS1 --> S3
    ECS1 --> RDS
    ECS2 --> S3
    ECS2 --> RDS
    ECS3 --> S3
    ECS3 --> RDS

    ECS1 --> CW
    ECS2 --> CW
    ECS3 --> CW

    ECS1 --> XR
    ECS2 --> XR
    ECS3 --> XR

    style BEDROCK fill:#FF9900,stroke:#232F3E,stroke-width:3px,color:#fff
```

### CI/CD Pipeline

```mermaid
flowchart LR
    DEV[Developer] -->|git push| GH[GitHub]

    GH --> CI{GitHub Actions}

    CI --> LINT[Lint & Format Check]
    CI --> TEST[Run Tests]
    CI --> TYPE[Type Check]

    LINT --> BUILD{All Passed?}
    TEST --> BUILD
    TYPE --> BUILD

    BUILD -->|Yes| DOCKER[Build Docker Images]
    BUILD -->|No| FAIL[❌ Build Failed]

    DOCKER --> ECR[Push to ECR]
    ECR --> DEPLOY[Deploy to ECS]

    DEPLOY --> HEALTH{Health Check}

    HEALTH -->|Pass| PROD[✅ Production]
    HEALTH -->|Fail| ROLLBACK[Rollback]

    ROLLBACK --> ALERT[Alert Team]

    style PROD fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style FAIL fill:#f44336,stroke:#c62828,stroke-width:2px,color:#fff
```

---

## Performance & Scalability

### Caching Strategy

```mermaid
graph TB
    REQ[API Request] --> CACHE{In Cache?}

    CACHE -->|Yes| RETURN[Return Cached]
    CACHE -->|No| PROCESS[Process Request]

    PROCESS --> AI{Requires AI?}

    AI -->|Yes| BEDROCK[Call Bedrock]
    AI -->|No| DB[Query Database]

    BEDROCK --> STORE1[Store in Cache<br/>TTL: 1 hour]
    DB --> STORE2[Store in Cache<br/>TTL: 5 minutes]

    STORE1 --> RETURN
    STORE2 --> RETURN

    RETURN --> CLIENT[Client]

    style BEDROCK fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
```

### Load Balancing

```mermaid
graph LR
    CLIENT[Clients] --> LB[Load Balancer]

    LB -->|Round Robin| API1[API Instance 1]
    LB -->|Round Robin| API2[API Instance 2]
    LB -->|Round Robin| API3[API Instance 3]

    API1 --> QUEUE[Message Queue]
    API2 --> QUEUE
    API3 --> QUEUE

    QUEUE --> W1[Worker 1<br/>Generate]
    QUEUE --> W2[Worker 2<br/>Generate]
    QUEUE --> W3[Worker 3<br/>Generate]

    W1 --> BEDROCK[AWS Bedrock]
    W2 --> BEDROCK
    W3 --> BEDROCK

    style BEDROCK fill:#FF9900,stroke:#232F3E,stroke-width:3px,color:#fff
```

---

## Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Auth as Auth Service
    participant DB as Database

    User->>Frontend: Enter Credentials
    Frontend->>API: POST /auth/login
    API->>Auth: Validate Credentials
    Auth->>DB: Check User
    DB-->>Auth: User Data

    alt Valid Credentials
        Auth-->>API: Generate JWT
        API-->>Frontend: Return Token
        Frontend->>Frontend: Store Token
        Frontend-->>User: Login Success
    else Invalid Credentials
        Auth-->>API: Reject
        API-->>Frontend: 401 Unauthorized
        Frontend-->>User: Login Failed
    end

    User->>Frontend: Make Request
    Frontend->>API: Request + JWT
    API->>API: Validate Token
    API->>DB: Fetch Data
    DB-->>API: Data
    API-->>Frontend: Response
    Frontend-->>User: Display Data
```

### Data Flow Security

```mermaid
graph TB
    USER[User] -->|HTTPS| CDN[CloudFront]
    CDN -->|TLS 1.3| ALB[Load Balancer]
    ALB -->|Internal| API[API Server]

    API -->|AWS IAM| BEDROCK[Bedrock]
    API -->|Encrypted| S3[S3 Bucket]
    API -->|TLS| DB[(Database)]

    subgraph "Encryption at Rest"
        S3
        DB
    end

    subgraph "Encryption in Transit"
        CDN
        ALB
        API
    end

    style BEDROCK fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
```

---

## Monitoring & Observability

### Metrics Dashboard

```mermaid
graph TB
    subgraph "Application Metrics"
        A1[Request Rate]
        A2[Error Rate]
        A3[Latency p50/p95/p99]
    end

    subgraph "AI Metrics"
        B1[Bedrock Invocations]
        B2[Token Usage]
        B3[Generation Time]
        B4[Cost per Request]
    end

    subgraph "Business Metrics"
        C1[Workflows Generated]
        C2[Execution Success Rate]
        C3[User Sessions]
    end

    subgraph "Infrastructure Metrics"
        D1[CPU Usage]
        D2[Memory Usage]
        D3[Network I/O]
    end

    A1 --> DASHBOARD[CloudWatch Dashboard]
    A2 --> DASHBOARD
    A3 --> DASHBOARD
    B1 --> DASHBOARD
    B2 --> DASHBOARD
    B3 --> DASHBOARD
    B4 --> DASHBOARD
    C1 --> DASHBOARD
    C2 --> DASHBOARD
    C3 --> DASHBOARD
    D1 --> DASHBOARD
    D2 --> DASHBOARD
    D3 --> DASHBOARD

    DASHBOARD --> ALERTS{Threshold?}
    ALERTS -->|Exceeded| NOTIFY[SNS Notification]
    NOTIFY --> TEAM[Dev Team]

    style DASHBOARD fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
```

---

## User Journey Flow

### End-to-End User Experience

```mermaid
journey
    title Shadow Worker User Journey
    section Discovery
      Visit Homepage: 5: User
      Read Features: 4: User
      Watch Demo: 5: User
    section Recording
      Start Recording: 5: User
      Perform Task: 5: User
      Review Events: 4: User
      Stop Recording: 5: User
    section Generation
      Click Generate: 5: User
      AI Processing: 3: System
      Review Workflow: 5: User
      Edit if Needed: 4: User
    section Execution
      Select Workflow: 5: User
      Start Execution: 5: User
      Monitor Progress: 4: User, System
      View Results: 5: User
    section Iteration
      Optimize Workflow: 4: User
      Re-execute: 5: User
      Share Workflow: 5: User
```

---

## Comparison Charts

### Traditional vs AI-Powered Automation

```mermaid
graph LR
    subgraph "Traditional Automation"
        T1[Manual Scripting] --> T2[Brittle Selectors]
        T2 --> T3[High Maintenance]
        T3 --> T4[Technical Skills Required]
    end

    subgraph "Shadow Worker"
        S1[Record Once] --> S2[AI Optimization]
        S2 --> S3[Self-Healing]
        S3 --> S4[No Coding Required]
    end

    style S1 fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style S2 fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
    style S3 fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
```

---

<div align="center">

**These diagrams can be exported as images for presentations using Mermaid Live Editor**

[Mermaid Live Editor](https://mermaid.live)

**[Back to Main README](README.md)** | **[Architecture Details](ARCHITECTURE.md)**

</div>
