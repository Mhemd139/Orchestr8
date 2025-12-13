# Architecture Deep Dive

## Table of Contents
- [System Overview](#system-overview)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [AI Pipeline](#ai-pipeline)
- [Database Schema](#database-schema)
- [API Specifications](#api-specifications)
- [Security Considerations](#security-considerations)
- [Scalability & Performance](#scalability--performance)

---

## System Overview

Shadow Worker follows a modern **microservices-inspired architecture** with clear separation between presentation, business logic, and AI services.

```mermaid
graph TB
    subgraph "Client Tier"
        UI[React SPA<br/>Port 5173]
    end

    subgraph "Application Tier"
        API[FastAPI Server<br/>Port 8000]
        GEN[Workflow Generator]
        CONV[Format Converter]
    end

    subgraph "AI Tier"
        BEDROCK[AWS Bedrock Client]
        NOVA[Amazon Nova Pro]
        IMG[Image Processor]
    end

    subgraph "Data Tier"
        SESS[(Session Store)]
        WORK[(Workflow Store)]
        S3[(S3 Screenshots)]
    end

    UI -->|REST API| API
    API --> GEN
    API --> CONV
    GEN --> BEDROCK
    BEDROCK --> NOVA
    GEN --> IMG
    IMG --> S3
    GEN --> SESS
    GEN --> WORK

    style NOVA fill:#FF9900,stroke:#232F3E,stroke-width:3px,color:#fff
    style GEN fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
```

---

## Component Architecture

### Frontend Components

```mermaid
graph TB
    subgraph "Pages"
        HOME[HomePage]
        TEACH[TeachPage]
        RUN[RunPage]
        SETTINGS[SettingsPage]
    end

    subgraph "Teach Components"
        CONTROLS[RecordingControls]
        EVENTLOG[EventLog]
        OVERVIEW[RecordingOverview]
        CAPTURE[ScreenshotCapture]
    end

    subgraph "Run Components"
        SELECTOR[WorkflowSelector]
        EXECUTOR[WorkflowExecutor]
        STATUS[ExecutionStatus]
        TIMELINE[TimelineStrip]
    end

    subgraph "Shared Components"
        NAV[Navigation]
        TOAST[ToastNotifications]
        MODAL[ModalDialogs]
    end

    subgraph "Services"
        APILIB[API Client]
        STATE[State Management]
        STORAGE[Local Storage]
    end

    TEACH --> CONTROLS
    TEACH --> EVENTLOG
    TEACH --> OVERVIEW
    TEACH --> CAPTURE

    RUN --> SELECTOR
    RUN --> EXECUTOR
    RUN --> STATUS
    RUN --> TIMELINE

    CONTROLS --> APILIB
    EXECUTOR --> APILIB
    APILIB --> STATE
    STATE --> STORAGE

    style TEACH fill:#61DAFB,stroke:#20232A,stroke-width:2px
    style RUN fill:#61DAFB,stroke:#20232A,stroke-width:2px
```

### Backend Architecture

```mermaid
graph LR
    subgraph "API Layer"
        ROUTER[FastAPI Router]
        HEALTH[Health Check]
        GENERATE[Generate Endpoint]
    end

    subgraph "Core Layer"
        GEN[WorkflowGenerator]
        SIMPLE[EventSimplifier]
        ENRICH[SelectorEnricher]
        WAIT[WaitStepInserter]
    end

    subgraph "Service Layer"
        BEDROCK[BedrockClient]
        IMAGE[ImageProcessor]
        S3[S3Client]
    end

    subgraph "Model Layer"
        EVENT[EventLog]
        SESSION[SessionTimeline]
        WORKFLOW[WorkflowDefinition]
        STEP[WorkflowStep]
    end

    ROUTER --> HEALTH
    ROUTER --> GENERATE
    GENERATE --> GEN
    GEN --> SIMPLE
    GEN --> BEDROCK
    GEN --> ENRICH
    GEN --> WAIT
    BEDROCK --> IMAGE
    IMAGE --> S3

    GEN --> EVENT
    GEN --> SESSION
    GEN --> WORKFLOW
    WORKFLOW --> STEP

    style GEN fill:#4CAF50,stroke:#2E7D32,stroke-width:2px
```

---

## Data Flow

### Recording Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as React UI
    participant EventCapture as Event Capturer
    participant Storage as Local Storage
    participant API as FastAPI

    User->>UI: Start Recording
    UI->>EventCapture: Initialize capture

    loop Every User Action
        User->>EventCapture: Perform action
        EventCapture->>EventCapture: Capture metadata
        EventCapture->>EventCapture: Take screenshot
        EventCapture->>Storage: Store event
        EventCapture->>UI: Update live display
    end

    User->>UI: Stop Recording
    UI->>Storage: Retrieve all events
    Storage->>UI: SessionTimeline
    UI->>API: POST /generate
    API-->>UI: WorkflowDefinition
    UI->>Storage: Save workflow
    UI->>User: Display workflow
```

### Workflow Generation Flow

```mermaid
flowchart TD
    START([SessionTimeline]) --> SIMPLIFY[Event Simplification]

    SIMPLIFY --> GROUP[Group Typing Sequences]
    GROUP --> DETECT[Detect Copy/Paste Patterns]
    DETECT --> MERGE[Merge Related Events]

    MERGE --> DECISION{Generation Mode?}

    DECISION -->|AI Mode| PREPARE[Prepare Bedrock Input]
    DECISION -->|Deterministic| RULES[Apply Rule-Based Logic]

    PREPARE --> BEDROCK[Invoke Nova Pro]
    BEDROCK --> PARSE[Parse JSON Response]
    RULES --> PARSE

    PARSE --> ENRICH[Enrich Selectors]
    ENRICH --> ADD_TEXT[Add Text Selectors]
    ADD_TEXT --> ADD_COORDS[Add Coordinate Fallbacks]
    ADD_COORDS --> ADD_INDEX[Add Index Fallbacks]

    ADD_INDEX --> TIMING[Analyze Timing]
    TIMING --> INSERT_WAITS[Insert Wait Steps]
    INSERT_WAITS --> DESCRIBE[Generate Descriptions]

    DESCRIBE --> VALIDATE[Validate Workflow]
    VALIDATE --> END([WorkflowDefinition])

    style BEDROCK fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
    style ENRICH fill:#4CAF50,stroke:#2E7D32,stroke-width:2px
```

### Execution Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as React UI
    participant Executor as WorkflowExecutor
    participant System as OS/Browser
    participant Validator as StepValidator

    User->>UI: Select Workflow
    User->>UI: Click "Run"

    UI->>Executor: Execute workflow

    loop For Each Step
        Executor->>Validator: Validate step
        Validator-->>Executor: Valid

        Executor->>System: Find element (selector)

        alt Element Found
            System-->>Executor: Element reference
            Executor->>System: Perform action
            System-->>Executor: Success
            Executor->>UI: Update progress (✓)
        else Element Not Found - Try Fallback
            System-->>Executor: Not found
            Executor->>System: Try coordinate fallback
            alt Fallback Success
                System-->>Executor: Success
                Executor->>UI: Update progress (⚠)
            else All Fallbacks Failed
                System-->>Executor: Failed
                Executor->>UI: Update progress (✗)
                Executor->>User: Show error + options
            end
        end
    end

    Executor->>UI: Execution complete
    UI->>User: Show summary
```

---

## AI Pipeline

### Prompt Engineering Architecture

```mermaid
graph TB
    subgraph "Input Preparation"
        EVENTS[Raw Events]
        SCREENSHOTS[Screenshots]
        META[Metadata]
    end

    subgraph "Prompt Construction"
        SYSTEM[System Prompt<br/>- Rules<br/>- Schema<br/>- Examples]
        USER[User Prompt<br/>- Timeline<br/>- Context]
        IMAGES[Image Content<br/>- Base64 Images<br/>- Descriptions]
    end

    subgraph "Model Invocation"
        BEDROCK[AWS Bedrock API]
        NOVA[Amazon Nova Pro<br/>- Temperature: 0.7<br/>- Max Tokens: 4096<br/>- Top-P: 0.9]
    end

    subgraph "Response Processing"
        PARSE[JSON Parser]
        VALIDATE[Schema Validator]
        ENRICH[Response Enricher]
    end

    subgraph "Output"
        WORKFLOW[WorkflowDefinition]
    end

    EVENTS --> SYSTEM
    EVENTS --> USER
    SCREENSHOTS --> IMAGES
    META --> USER

    SYSTEM --> BEDROCK
    USER --> BEDROCK
    IMAGES --> BEDROCK

    BEDROCK --> NOVA
    NOVA --> BEDROCK
    BEDROCK --> PARSE
    PARSE --> VALIDATE
    VALIDATE --> ENRICH
    ENRICH --> WORKFLOW

    style NOVA fill:#FF9900,stroke:#232F3E,stroke-width:3px,color:#fff
```

### Multimodal Processing

**Text Processing:**
```python
{
  "event_type": "MOUSE_CLICK",
  "timestamp": "2024-01-15T10:30:45Z",
  "details": {
    "coordinates": {"x": 450, "y": 200},
    "element_name": "Login Button",
    "element_type": "button"
  }
}
```

**Vision Processing:**
```python
{
  "type": "image",
  "source": {
    "type": "base64",
    "media_type": "image/png",
    "data": "iVBORw0KG..."
  }
}
```

**Fusion Output:**
```json
{
  "action": "CLICK",
  "selector": {
    "type": "text",
    "value": "Login Button",
    "fallback_coordinates": {"x": 450, "y": 200}
  },
  "description": "Click the login button to authenticate"
}
```

---

## Database Schema

### EventLog Schema

```typescript
interface EventLog {
  event_type: 'MOUSE_CLICK' | 'TEXT_INPUT' | 'KEY_PRESS' |
              'KEY_COMBINATION' | 'SCROLL' | 'MOUSE_DRAG' |
              'NAVIGATION' | 'WINDOW_SWITCH';
  timestamp: DateTime;
  details: {
    // Mouse events
    coordinates?: { x: number; y: number };
    button?: 'left' | 'right' | 'middle';
    click_type?: 'single' | 'double';

    // Keyboard events
    text?: string;
    key?: string;
    modifiers?: string[];

    // Scroll events
    direction?: 'up' | 'down' | 'left' | 'right';
    delta?: number;

    // Navigation events
    url?: string;
    title?: string;
  };
  screenshot_path?: string;
  element_metadata?: {
    tag_name?: string;
    id?: string;
    class_names?: string[];
    text_content?: string;
    attributes?: Record<string, string>;
  };
}
```

### WorkflowDefinition Schema

```typescript
interface WorkflowDefinition {
  workflow_name: string;
  description: string;
  created_at: DateTime;
  updated_at: DateTime;
  version: string;

  steps: WorkflowStep[];

  metadata: {
    source_session_id?: string;
    generation_mode?: 'ai' | 'deterministic';
    model_version?: string;
    tags?: string[];
    estimated_duration_seconds?: number;
  };
}

interface WorkflowStep {
  step_number: number;
  action: 'CLICK' | 'TYPE_TEXT' | 'PRESS_KEY' | 'SCROLL' |
          'DRAG' | 'WAIT' | 'NAVIGATE' | 'SCREENSHOT' |
          'VERIFY' | 'EXTRACT';

  selector?: {
    type: 'text' | 'coordinates' | 'xpath' | 'css';
    value: string;
    fallback_coordinates?: { x: number; y: number };
    fallback_index?: number;
  };

  parameters: {
    // Type-specific parameters
    text?: string;
    key?: string;
    duration_ms?: number;
    url?: string;
    // ... etc
  };

  description: string;
  estimated_duration_ms?: number;
  retry_config?: {
    max_retries: number;
    retry_delay_ms: number;
  };
}
```

---

## API Specifications

### REST Endpoints

#### `POST /api/generate`
Generate workflow from session timeline

**Request:**
```json
{
  "session_timeline": {
    "session_id": "sess_abc123",
    "application_name": "Web Browser",
    "start_time": "2024-01-15T10:00:00Z",
    "end_time": "2024-01-15T10:05:30Z",
    "events": [/* EventLog[] */],
    "metadata": {}
  },
  "options": {
    "mode": "ai",
    "use_vision": true,
    "include_screenshots": true
  }
}
```

**Response:**
```json
{
  "workflow": {
    "workflow_name": "Login and Dashboard Access",
    "description": "Automated login flow with dashboard navigation",
    "steps": [/* WorkflowStep[] */],
    "metadata": {
      "generation_time_ms": 2347,
      "model_used": "amazon.nova-pro-v1:0",
      "cost_usd": 0.012
    }
  }
}
```

#### `GET /api/health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "bedrock": "connected",
    "s3": "connected"
  }
}
```

---

## Security Considerations

### Authentication & Authorization

```mermaid
graph LR
    USER[User Request] --> AUTH[Auth Middleware]
    AUTH --> VALIDATE{Valid Token?}
    VALIDATE -->|Yes| AUTHORIZE{Authorized?}
    VALIDATE -->|No| REJECT[401 Unauthorized]
    AUTHORIZE -->|Yes| HANDLER[Route Handler]
    AUTHORIZE -->|No| FORBIDDEN[403 Forbidden]
    HANDLER --> RESPONSE[Response]

    style REJECT fill:#f44336,stroke:#c62828,color:#fff
    style FORBIDDEN fill:#f44336,stroke:#c62828,color:#fff
```

### Data Protection

| Layer | Protection Mechanism |
|-------|---------------------|
| **Transport** | TLS 1.3 encryption for all API calls |
| **Storage** | Encrypted S3 buckets for screenshots |
| **API Keys** | AWS IAM roles with least privilege |
| **Secrets** | Environment variables, no hardcoding |
| **Input Validation** | Pydantic models with strict validation |
| **Output Sanitization** | JSON schema validation |

### AWS Bedrock Security

- **IAM Policies:** Scoped to specific models and actions
- **VPC Endpoints:** Private connectivity to Bedrock
- **CloudTrail:** Full audit logging of API calls
- **Encryption:** Data encrypted at rest and in transit

---

## Scalability & Performance

### Horizontal Scaling Architecture

```mermaid
graph TB
    LB[Load Balancer]

    subgraph "API Cluster"
        API1[FastAPI Instance 1]
        API2[FastAPI Instance 2]
        API3[FastAPI Instance N]
    end

    subgraph "Worker Pool"
        WORKER1[Generator Worker 1]
        WORKER2[Generator Worker 2]
        WORKER3[Generator Worker N]
    end

    subgraph "Shared Services"
        REDIS[(Redis Cache)]
        QUEUE[Message Queue]
        S3[(S3 Storage)]
    end

    LB --> API1
    LB --> API2
    LB --> API3

    API1 --> QUEUE
    API2 --> QUEUE
    API3 --> QUEUE

    QUEUE --> WORKER1
    QUEUE --> WORKER2
    QUEUE --> WORKER3

    WORKER1 --> REDIS
    WORKER2 --> REDIS
    WORKER3 --> REDIS

    WORKER1 --> S3
    WORKER2 --> S3
    WORKER3 --> S3
```

### Performance Optimizations

#### Caching Strategy

```python
# Redis cache for frequently accessed workflows
@cache(ttl=3600)
async def get_workflow(workflow_id: str) -> WorkflowDefinition:
    return await db.workflows.find_one({"id": workflow_id})

# In-memory cache for session data during generation
session_cache = TTLCache(maxsize=1000, ttl=300)
```

#### Async Processing

```python
# Concurrent screenshot processing
async def process_screenshots(screenshot_paths: List[str]) -> List[str]:
    tasks = [
        process_single_screenshot(path)
        for path in screenshot_paths
    ]
    return await asyncio.gather(*tasks)
```

#### Batch Processing

```python
# Batch multiple workflow generations
async def generate_workflows_batch(
    sessions: List[SessionTimeline]
) -> List[WorkflowDefinition]:
    # Process up to 10 concurrent Bedrock requests
    semaphore = asyncio.Semaphore(10)
    async def generate_with_limit(session):
        async with semaphore:
            return await generate_workflow(session)

    return await asyncio.gather(*[
        generate_with_limit(s) for s in sessions
    ])
```

### Performance Metrics

| Operation | Target Latency | Current p95 |
|-----------|---------------|-------------|
| Event capture | < 10ms | 3ms |
| Screenshot processing | < 100ms | 45ms |
| Workflow generation (deterministic) | < 200ms | 120ms |
| Workflow generation (AI) | < 5s | 2.3s |
| Workflow execution (per step) | < 500ms | 180ms |
| API response (non-generation) | < 100ms | 35ms |

---

## Deployment Architecture

### Production Deployment

```mermaid
graph TB
    subgraph "CloudFront CDN"
        CDN[Static Assets]
    end

    subgraph "Application Load Balancer"
        ALB[ALB]
    end

    subgraph "ECS Fargate Cluster"
        API1[FastAPI Container 1]
        API2[FastAPI Container 2]
    end

    subgraph "AWS Services"
        BEDROCK[AWS Bedrock]
        S3[S3 Buckets]
        SECRETS[Secrets Manager]
        CLOUDWATCH[CloudWatch Logs]
    end

    CLIENT[Client Browser] --> CDN
    CLIENT --> ALB
    ALB --> API1
    ALB --> API2

    API1 --> BEDROCK
    API2 --> BEDROCK
    API1 --> S3
    API2 --> S3
    API1 --> SECRETS
    API2 --> SECRETS

    API1 --> CLOUDWATCH
    API2 --> CLOUDWATCH

    style BEDROCK fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff
```

### CI/CD Pipeline

```mermaid
graph LR
    GIT[Git Push] --> GH[GitHub Actions]
    GH --> TEST[Run Tests]
    TEST --> LINT[Linting]
    LINT --> BUILD[Build Images]
    BUILD --> PUSH[Push to ECR]
    PUSH --> DEPLOY[Deploy to ECS]
    DEPLOY --> HEALTH[Health Check]
    HEALTH --> PROD[Production]

    style PROD fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
```

---

## Monitoring & Observability

### Metrics Dashboard

```typescript
// Key metrics tracked
const metrics = {
  api: {
    requests_per_second: Metric,
    error_rate: Metric,
    latency_p50: Metric,
    latency_p95: Metric,
    latency_p99: Metric
  },
  bedrock: {
    invocations_per_minute: Metric,
    tokens_consumed: Metric,
    cost_per_hour: Metric,
    error_rate: Metric
  },
  workflows: {
    generated_per_hour: Metric,
    execution_success_rate: Metric,
    average_steps: Metric
  }
}
```

### Logging Strategy

```python
# Structured logging with correlation IDs
logger.info(
    "workflow_generated",
    extra={
        "correlation_id": request.correlation_id,
        "session_id": session.id,
        "workflow_id": workflow.id,
        "generation_time_ms": generation_time,
        "step_count": len(workflow.steps),
        "model": "nova-pro-v1"
    }
)
```

---

## Technology Decisions & Trade-offs

### Why FastAPI?
✅ **Pros:** Async support, automatic OpenAPI docs, Pydantic integration
❌ **Cons:** Smaller ecosystem than Flask/Django
**Decision:** Performance and modern async patterns outweigh ecosystem size

### Why React over Vue/Svelte?
✅ **Pros:** Larger talent pool, extensive libraries, strong TypeScript support
❌ **Cons:** More boilerplate, larger bundle size
**Decision:** Industry standard with best tooling support

### Why AWS Bedrock over OpenAI?
✅ **Pros:** Multimodal support, AWS integration, enterprise SLAs
❌ **Cons:** Newer service, fewer models available
**Decision:** Multimodal capabilities and AWS ecosystem integration critical

### Why Pydantic v2?
✅ **Pros:** Performance, validation, JSON schema generation
❌ **Cons:** Breaking changes from v1
**Decision:** Performance gains and type safety worth migration cost

---

<div align="center">

**[Back to Main README](README.md)**

</div>
