# Contributing to Shadow Worker

Thank you for your interest in contributing to Shadow Worker! This document provides guidelines and information for contributors.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Submitting Changes](#submitting-changes)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Python 3.8+** installed
- **Node.js 18+** and npm
- **Git** for version control
- **AWS Account** with Bedrock access (for AI features)
- **Code Editor** (VS Code recommended)

### Fork & Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/bedrock-workflow-generator.git
cd bedrock-workflow-generator

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/bedrock-workflow-generator.git
```

---

## Development Setup

### Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install development dependencies
pip install -r requirements-dev.txt

# Run tests to verify setup
pytest tests/
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run linting to verify setup
npm run lint

# Run type checking
npm run type-check
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Bedrock Configuration
BEDROCK_MODEL_ID=amazon.nova-pro-v1:0

# Application Configuration
API_PORT=8000
FRONTEND_PORT=5173
LOG_LEVEL=INFO
```

---

## Development Workflow

### 1. Create a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Backend tests
pytest tests/ -v --cov=src

# Frontend tests
cd frontend
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

### 4. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Format: <type>(<scope>): <subject>

# Examples:
git commit -m "feat(generator): add support for drag-and-drop events"
git commit -m "fix(api): resolve timeout issue in workflow generation"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(workflow): add tests for selector enrichment"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or tooling changes

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
# Fill in the PR template with details about your changes
```

---

## Code Standards

### Python Code Style

We follow **PEP 8** with these tools:

```bash
# Format code with Black
black src/ tests/

# Sort imports with isort
isort src/ tests/

# Lint with flake8
flake8 src/ tests/

# Type checking with mypy
mypy src/
```

**Key Guidelines:**
- Maximum line length: 88 characters (Black default)
- Use type hints for function signatures
- Write docstrings for all public functions/classes
- Use descriptive variable names

**Example:**

```python
from typing import List, Optional
from pydantic import BaseModel

def generate_workflow(
    session_timeline: SessionTimeline,
    use_vision: bool = True
) -> WorkflowDefinition:
    """
    Generate a workflow definition from a session timeline.

    Args:
        session_timeline: The recorded user interaction timeline
        use_vision: Whether to include screenshot analysis

    Returns:
        Optimized workflow definition ready for execution

    Raises:
        ValidationError: If the session timeline is invalid
        BedrockError: If the AI service call fails
    """
    # Implementation here
    pass
```

### TypeScript/React Code Style

We use **ESLint** and **Prettier**:

```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

**Key Guidelines:**
- Use functional components with hooks
- Prefer `const` over `let`, avoid `var`
- Use TypeScript strict mode
- Write JSDoc comments for complex functions

**Example:**

```typescript
interface WorkflowGenerationProps {
  sessionId: string;
  onComplete: (workflow: WorkflowDefinition) => void;
  onError: (error: Error) => void;
}

/**
 * Component for generating workflows from recorded sessions
 */
export const WorkflowGeneration: React.FC<WorkflowGenerationProps> = ({
  sessionId,
  onComplete,
  onError
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const workflow = await api.generateWorkflow(sessionId);
      onComplete(workflow);
    } catch (error) {
      onError(error as Error);
    } finally {
      setIsGenerating(false);
    }
  }, [sessionId, onComplete, onError]);

  return (
    // JSX here
  );
};
```

---

## Testing Requirements

### Backend Testing

All new features must include:

1. **Unit Tests** - Test individual functions/methods
2. **Integration Tests** - Test component interactions
3. **Edge Cases** - Test error conditions and boundaries

```python
# tests/test_workflow_generator.py

import pytest
from src.core.workflow_generator import WorkflowGenerator
from src.models.events import SessionTimeline, EventLog

@pytest.fixture
def sample_session():
    """Create a sample session timeline for testing"""
    return SessionTimeline(
        session_id="test_123",
        application_name="Test App",
        start_time=datetime.now(),
        end_time=datetime.now(),
        events=[
            EventLog(
                event_type="MOUSE_CLICK",
                timestamp=datetime.now(),
                details={"coordinates": {"x": 100, "y": 200}}
            )
        ]
    )

def test_workflow_generation_basic(sample_session):
    """Test basic workflow generation"""
    generator = WorkflowGenerator()
    workflow = generator.generate_from_events_only(sample_session)

    assert workflow is not None
    assert len(workflow.steps) > 0
    assert workflow.steps[0].action == "CLICK"

def test_workflow_generation_with_invalid_session():
    """Test error handling with invalid session"""
    generator = WorkflowGenerator()

    with pytest.raises(ValidationError):
        generator.generate_from_events_only(None)
```

### Frontend Testing

Use **React Testing Library** for component tests:

```typescript
// src/components/WorkflowGeneration.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkflowGeneration } from './WorkflowGeneration';

describe('WorkflowGeneration', () => {
  it('renders generate button', () => {
    render(
      <WorkflowGeneration
        sessionId="test_123"
        onComplete={jest.fn()}
        onError={jest.fn()}
      />
    );

    expect(screen.getByText('Generate Workflow')).toBeInTheDocument();
  });

  it('calls onComplete when generation succeeds', async () => {
    const onComplete = jest.fn();

    render(
      <WorkflowGeneration
        sessionId="test_123"
        onComplete={onComplete}
        onError={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText('Generate Workflow'));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          workflow_name: expect.any(String)
        })
      );
    });
  });
});
```

### Test Coverage Requirements

- **Minimum coverage**: 80% for new code
- **Core modules**: 90%+ coverage required
- **Run coverage reports**:

```bash
# Python coverage
pytest tests/ --cov=src --cov-report=html

# JavaScript coverage
npm run test:coverage
```

---

## Submitting Changes

### Pull Request Guidelines

1. **Fill in the PR template** completely
2. **Link related issues** using "Fixes #123" or "Closes #456"
3. **Provide context** - Explain why the change is needed
4. **Include screenshots** for UI changes
5. **Keep PRs focused** - One feature/fix per PR
6. **Update documentation** if behavior changes

### PR Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Testing
- [ ] All tests pass locally
- [ ] Added tests for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated as needed

## Screenshots (if applicable)
[Add screenshots here]

## Additional Notes
[Any additional context]
```

### Review Process

1. **Automated checks** must pass (tests, linting, type checking)
2. **Code review** by at least one maintainer
3. **Address feedback** and push updates as needed
4. **Squash and merge** once approved

---

## Project Structure Guidelines

### Adding New Components

**Backend:**
```
src/
├── api/           # API routes and endpoints
├── core/          # Core business logic
├── models/        # Pydantic data models
├── services/      # External service integrations
├── tools/         # Utility tools
└── utils/         # Helper functions
```

**Frontend:**
```
frontend/src/
├── pages/         # Top-level page components
├── components/    # Reusable UI components
│   ├── teach/    # Recording-related components
│   ├── run/      # Execution-related components
│   └── ui/       # Base UI components (shadcn)
├── lib/          # Utilities and API client
└── types/        # TypeScript type definitions
```

### File Naming Conventions

- **Python files**: `snake_case.py`
- **TypeScript/React files**: `PascalCase.tsx` for components, `camelCase.ts` for utilities
- **Test files**: `test_*.py` or `*.test.tsx`
- **Config files**: `kebab-case.json`

---

## Common Tasks

### Adding a New Event Type

1. Update the event model:
```python
# src/models/events.py
class EventLog(BaseModel):
    event_type: Literal[
        "MOUSE_CLICK",
        "TEXT_INPUT",
        "YOUR_NEW_EVENT",  # Add here
        ...
    ]
```

2. Update the generator logic:
```python
# src/core/workflow_generator.py
def _convert_event_to_step(self, event: EventLog) -> WorkflowStep:
    if event.event_type == "YOUR_NEW_EVENT":
        # Handle new event type
        pass
```

3. Add tests:
```python
# tests/test_workflow_generator.py
def test_new_event_type():
    # Test your new event type
    pass
```

### Adding a New API Endpoint

1. Define the route:
```python
# src/api/main.py
@app.post("/api/your-endpoint")
async def your_endpoint(request: YourRequestModel) -> YourResponseModel:
    # Implementation
    pass
```

2. Add request/response models:
```python
# src/models/api.py
class YourRequestModel(BaseModel):
    # Define fields
    pass

class YourResponseModel(BaseModel):
    # Define fields
    pass
```

3. Update API client:
```typescript
// frontend/src/lib/api.ts
export async function yourEndpoint(
  data: YourRequestData
): Promise<YourResponseData> {
  return apiClient.post('/api/your-endpoint', data);
}
```

---

## Getting Help

- **Documentation**: Check [README.md](README.md) and [ARCHITECTURE.md](ARCHITECTURE.md)
- **Issues**: Browse existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact maintainers at [email]

---

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Project README acknowledgments

Thank you for contributing to Shadow Worker! 🎉

---

<div align="center">

**[Back to Main README](README.md)**

</div>
