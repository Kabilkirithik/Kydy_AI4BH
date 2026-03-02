# Design Document: Kydy Adaptive AI Tutor

## Overview

Kydy is an adaptive AI tutoring system that generates interactive, visual lessons in real-time by orchestrating multiple AI tools through the CrewAI framework. The system converts learner topic requests into structured teaching plans, generates synchronized SVG visuals with natural-language narration, and provides contextual doubt resolution during lesson playback.

The architecture follows a single-agent, multi-tool pattern where a CrewAI orchestrator agent coordinates specialized tools for planning, SVG generation, TTS synthesis, sanitization, caching, and analytics. The system prioritizes lightweight delivery (SVG < 200 KB), low latency (< 8s generation), and security through server-side validation.

### Key Design Principles

1. **Agent-Tool Orchestration**: Single CrewAI agent with specialized tools rather than multi-agent complexity
2. **Cache-First Strategy**: Check DynamoDB/S3 cache before expensive generation
3. **Graceful Degradation**: Fallback chains for LLM (Claude → Nova) and TTS (Sarvam → Polly)
4. **Security by Default**: Server-side SVG sanitization, IAM least-privilege, secrets management
5. **Lightweight Visuals**: SVG-based graphics for minimal bandwidth and programmatic manipulation
6. **Synchronization**: TTS metadata embedded in SVG for audio-visual coordination

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  (React/Flutter Web Client with Session Controls & SVG Player)  │
└────────────────┬────────────────────────────────────────────────┘
                 │ HTTPS/REST
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway (AWS)                           │
│              (Request Validation, Rate Limiting)                 │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CrewAI Orchestrator Agent                      │
│                  (Lambda/ECS Container)                          │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tool: Planner                                            │  │
│  │  - Calls Amazon Bedrock (Claude 3 Opus)                  │  │
│  │  - Fallback: Amazon Nova Pro                             │  │
│  │  - Produces Teaching_Plan JSON                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tool: SVG_Generator                                      │  │
│  │  - Generates SVG markup from visual_spec                 │  │
│  │  - Embeds tts_meta attributes                            │  │
│  │  - Validates size < 200 KB                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tool: Sanitizer                                          │  │
│  │  - Server-side SVG validation                            │  │
│  │  - Whitelist-based element filtering                     │  │
│  │  - XSS prevention                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tool: TTS                                                │  │
│  │  - Primary: Sarvam API                                    │  │
│  │  - Fallback: Amazon Polly                                │  │
│  │  - Uploads to S3, returns CDN URL                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tool: Cache                                              │  │
│  │  - DynamoDB manifest lookup                              │  │
│  │  - S3 artifact retrieval                                 │  │
│  │  - Cache key computation                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tool: Analytics                                          │  │
│  │  - CloudWatch logging                                     │  │
│  │  - Metrics tracking                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Storage & Services                          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  DynamoDB    │  │  S3 Bucket   │  │  CloudFront  │          │
│  │  (Manifests) │  │  (SVG/Audio) │  │  (CDN)       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Secrets     │  │  CloudWatch  │  │  SQS Queue   │          │
│  │  Manager     │  │  (Logs)      │  │  (Requests)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

#### Initial Lesson Generation

1. **Client Request**: Learner submits topic, skill_level, language
2. **API Gateway**: Validates request, forwards to orchestrator
3. **Cache Check**: Cache_Tool computes cache key, queries DynamoDB
4. **Cache Hit**: Return cached manifest with CDN URLs
5. **Cache Miss**: Proceed with generation
6. **Planning**: Planner_Tool calls Bedrock (Claude 3 Opus) to generate Teaching_Plan
7. **SVG Generation**: For each Lesson_Step, SVG_Generator_Tool creates SVG markup
8. **Sanitization**: Sanitizer_Tool validates and cleans SVG
9. **TTS Synthesis**: TTS_Tool generates audio (Sarvam → Polly fallback)
10. **Asset Upload**: Upload SVG and audio to S3
11. **Manifest Assembly**: Create lesson manifest with CDN URLs
12. **Cache Storage**: Store manifest in DynamoDB, mark as Golden_Lesson
13. **Response**: Return manifest to client

#### Doubt Resolution Flow

1. **Doubt Submission**: Learner pauses session, submits doubt question
2. **Context Extraction**: Extract current Lesson_Step and session context
3. **Clarification Planning**: Planner_Tool generates focused Teaching_Plan for doubt
4. **Clarification Generation**: Generate 1-3 Lesson_Steps with SVG and TTS
5. **Timeline Insertion**: Insert Clarification_Sequence into Session_Timeline
6. **Resume Playback**: Continue with clarification, then resume original lesson

## Components and Interfaces

### CrewAI Orchestrator Agent

The orchestrator is a single CrewAI agent responsible for coordinating all tools to fulfill lesson generation and doubt resolution requests.

**Agent Configuration**:
```python
from crewai import Agent, Task, Crew
from langchain_aws import ChatBedrock

# Initialize Bedrock LLM for agent reasoning
agent_llm = ChatBedrock(
    model_id="anthropic.claude-3-opus-20240229-v1:0",
    region_name="us-east-1"
)

kydy_agent = Agent(
    role="Adaptive Lesson Orchestrator",
    goal="Generate interactive visual lessons with synchronized narration",
    backstory="Expert at decomposing topics into pedagogical sequences",
    llm=agent_llm,
    tools=[
        planner_tool,
        svg_generator_tool,
        sanitizer_tool,
        tts_tool,
        cache_tool,
        analytics_tool
    ],
    verbose=True
)
```

### Tool: Planner

**Purpose**: Generate structured teaching plans by calling Amazon Bedrock.

**Interface**:
```python
@tool("planner")
def planner_tool(topic: str, skill_level: str, language: str, context: str = "") -> dict:
    """
    Generate a structured teaching plan for the given topic.
    
    Args:
        topic: Subject matter to teach
        skill_level: beginner | intermediate | advanced
        language: en | hi | ta
        context: Optional context for doubt clarification
    
    Returns:
        Teaching_Plan JSON with ordered Lesson_Steps
    """
```

**Teaching_Plan Schema**:
```json
{
  "lesson_id": "uuid",
  "topic": "string",
  "skill_level": "beginner|intermediate|advanced",
  "language": "en|hi|ta",
  "steps": [
    {
      "step_id": "string",
      "title": "string",
      "narration_text": "string",
      "visual_spec": {
        "type": "diagram|graph|animation|illustration",
        "elements": ["element descriptions"],
        "layout": "string"
      },
      "duration_estimate": "number (seconds)"
    }
  ],
  "total_duration": "number (seconds)"
}
```

**Prompt Template**:
```
You are an expert educator creating a visual lesson plan.

Topic: {topic}
Skill Level: {skill_level}
Language: {language}
Context: {context}

Generate a structured teaching plan with 3-12 steps. Each step should:
1. Have a clear learning objective
2. Include narration text (2-4 sentences) in {language}
3. Specify visual elements (diagrams, graphs, animations)
4. Build on previous steps logically

Output valid JSON matching the Teaching_Plan schema.
Focus on visual explanations that can be rendered as SVG.
```

**Implementation**:
- Primary: Amazon Bedrock with Claude 3 Opus
- Fallback: Amazon Nova Pro
- Retry logic: 1 retry on failure
- Timeout: 5 seconds

### Tool: SVG_Generator

**Purpose**: Generate validated SVG markup from visual specifications.

**Interface**:
```python
@tool("svg_generator")
def svg_generator_tool(visual_spec: dict, step_id: str, narration_text: str) -> str:
    """
    Generate SVG markup from visual specification.
    
    Args:
        visual_spec: Visual specification from Teaching_Plan
        step_id: Unique identifier for this step
        narration_text: Text for synchronization metadata
    
    Returns:
        Valid SVG markup string with tts_meta attributes
    """
```

**SVG Generation Strategy**:
1. Parse visual_spec to determine SVG structure
2. Generate semantic element IDs (e.g., `step-1-diagram-node-a`)
3. Embed `data-tts-start` and `data-tts-end` attributes for synchronization
4. Add `aria-label` attributes for accessibility
5. Validate size < 200 KB
6. If size exceeds limit, simplify and regenerate

**Example SVG Output**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" 
     id="step-1" aria-label="Diagram showing photosynthesis process">
  <g id="step-1-chloroplast" data-tts-start="0.0" data-tts-end="3.5">
    <rect x="100" y="100" width="200" height="150" fill="#90EE90" />
    <text x="200" y="180" text-anchor="middle" aria-label="Chloroplast">
      Chloroplast
    </text>
  </g>
  <g id="step-1-sunlight" data-tts-start="3.5" data-tts-end="6.0">
    <path d="M 400 50 L 400 100" stroke="#FFD700" stroke-width="3" />
    <text x="420" y="75" aria-label="Sunlight">Sunlight</text>
  </g>
</svg>
```

### Tool: Sanitizer

**Purpose**: Validate and sanitize SVG markup to prevent XSS attacks.

**Interface**:
```python
@tool("sanitizer")
def sanitizer_tool(svg_markup: str) -> str:
    """
    Sanitize SVG markup using whitelist-based filtering.
    
    Args:
        svg_markup: Raw SVG string
    
    Returns:
        Sanitized SVG string
    
    Raises:
        ValidationError: If SVG is malformed or contains unsafe content
    """
```

**Whitelist Configuration**:
```python
ALLOWED_ELEMENTS = {
    'svg', 'g', 'rect', 'circle', 'ellipse', 'line', 'polyline', 
    'polygon', 'path', 'text', 'tspan', 'defs', 'linearGradient',
    'radialGradient', 'stop', 'clipPath', 'mask', 'pattern'
}

ALLOWED_ATTRIBUTES = {
    'id', 'class', 'x', 'y', 'width', 'height', 'cx', 'cy', 'r',
    'rx', 'ry', 'x1', 'y1', 'x2', 'y2', 'points', 'd', 'fill',
    'stroke', 'stroke-width', 'opacity', 'transform', 'viewBox',
    'xmlns', 'aria-label', 'data-tts-start', 'data-tts-end',
    'text-anchor', 'font-size', 'font-family'
}

FORBIDDEN_PATTERNS = [
    'javascript:', 'on[a-z]+="', '<script', 'xlink:href="data:',
    'import', 'eval(', 'expression('
]
```

**Sanitization Process**:
1. Parse SVG with XML parser (reject if malformed)
2. Traverse DOM tree, remove non-whitelisted elements
3. Filter attributes, keep only whitelisted ones
4. Check for forbidden patterns in attribute values
5. Remove external resource references (except CDN audio URLs)
6. Validate final output is well-formed XML

### Tool: TTS

**Purpose**: Synthesize natural-language audio narration.

**Interface**:
```python
@tool("tts")
def tts_tool(narration_text: str, language: str, step_id: str) -> dict:
    """
    Synthesize audio from narration text.
    
    Args:
        narration_text: Text to synthesize
        language: en | hi | ta
        step_id: Unique identifier for this step
    
    Returns:
        {
            "audio_url": "CloudFront CDN URL",
            "duration": "number (seconds)",
            "timing_metadata": [{"word": "string", "start": float, "end": float}]
        }
    """
```

**Provider Configuration**:
```python
# Primary: Sarvam API
SARVAM_CONFIG = {
    "api_endpoint": "https://api.sarvam.ai/text-to-speech",
    "voices": {
        "en": "en-IN-female-1",
        "hi": "hi-IN-female-1",
        "ta": "ta-IN-female-1"
    },
    "format": "mp3",
    "sample_rate": 22050,
    "bitrate": 64
}

# Fallback: Amazon Polly
POLLY_CONFIG = {
    "region": "us-east-1",
    "voices": {
        "en": "Joanna",
        "hi": "Aditi",
        "ta": "Aditi"  # Polly has limited Tamil support
    },
    "output_format": "mp3",
    "sample_rate": "22050"
}
```

**TTS Flow**:
1. Call Sarvam API with narration_text and language
2. If Sarvam fails (timeout, error), fall back to Polly
3. Receive audio bytes and timing metadata
4. Upload audio to S3 bucket with key: `audio/{lesson_id}/{step_id}.mp3`
5. Generate CloudFront CDN URL
6. Return URL and timing metadata

### Tool: Cache

**Purpose**: Manage lesson artifact caching in DynamoDB and S3.

**Interface**:
```python
@tool("cache")
def cache_tool(operation: str, cache_key: str = None, manifest: dict = None) -> dict:
    """
    Manage lesson cache operations.
    
    Args:
        operation: "lookup" | "store"
        cache_key: Hash of (topic, skill_level, language)
        manifest: Lesson manifest to store (for "store" operation)
    
    Returns:
        For "lookup": {"hit": bool, "manifest": dict | None}
        For "store": {"success": bool}
    """
```

**Cache Key Computation**:
```python
import hashlib

def compute_cache_key(topic: str, skill_level: str, language: str) -> str:
    """Compute deterministic cache key."""
    normalized = f"{topic.lower().strip()}|{skill_level}|{language}"
    return hashlib.sha256(normalized.encode()).hexdigest()
```

**DynamoDB Schema**:
```
Table: kydy-lesson-cache
Partition Key: cache_key (String)
Attributes:
  - lesson_id (String)
  - topic (String)
  - skill_level (String)
  - language (String)
  - manifest_s3_key (String)
  - created_at (Number, Unix timestamp)
  - access_count (Number)
  - last_accessed (Number, Unix timestamp)
  - ttl (Number, Unix timestamp, 30 days)
```

**S3 Structure**:
```
s3://kydy-lessons/
  manifests/{lesson_id}.json
  svg/{lesson_id}/{step_id}.svg
  audio/{lesson_id}/{step_id}.mp3
```

### Tool: Analytics

**Purpose**: Log events and metrics to CloudWatch.

**Interface**:
```python
@tool("analytics")
def analytics_tool(event_type: str, data: dict) -> None:
    """
    Log analytics event to CloudWatch.
    
    Args:
        event_type: Event category (request, generation, error, doubt, etc.)
        data: Event-specific data dictionary
    """
```

**Event Types**:
- `lesson_request`: Topic, skill_level, language, timestamp
- `cache_hit`: Cache_key, lesson_id
- `cache_miss`: Cache_key, topic
- `generation_complete`: Lesson_id, latency, step_count, total_size
- `doubt_submitted`: Lesson_id, doubt_text, context_step
- `error`: Error_type, message, stack_trace
- `tts_provider`: Provider (sarvam | polly), language, duration

## Data Models

### Lesson Manifest

```typescript
interface LessonManifest {
  lesson_id: string;
  topic: string;
  skill_level: "beginner" | "intermediate" | "advanced";
  language: "en" | "hi" | "ta";
  created_at: number; // Unix timestamp
  total_duration: number; // seconds
  steps: LessonStep[];
  metadata: {
    cache_key: string;
    generation_latency: number;
    total_size_kb: number;
  };
}

interface LessonStep {
  step_id: string;
  title: string;
  narration_text: string;
  svg_url: string; // CloudFront CDN URL
  audio_url: string; // CloudFront CDN URL
  duration: number; // seconds
  timing_metadata: TimingMetadata[];
}

interface TimingMetadata {
  word: string;
  start: number; // seconds
  end: number; // seconds
}
```

### Clarification Request

```typescript
interface ClarificationRequest {
  session_id: string;
  lesson_id: string;
  current_step_id: string;
  doubt_text: string;
  context: {
    completed_steps: string[];
    current_position: number; // seconds into current step
  };
}

interface ClarificationResponse {
  clarification_id: string;
  steps: LessonStep[];
  insert_after_step: string;
}
```

### Session State

```typescript
interface SessionState {
  session_id: string;
  lesson_id: string;
  timeline: TimelineItem[];
  current_index: number;
  playback_state: "playing" | "paused" | "completed";
  clarifications: ClarificationMetadata[];
}

interface TimelineItem {
  type: "lesson_step" | "clarification_step";
  step: LessonStep;
  source_id: string; // lesson_id or clarification_id
}

interface ClarificationMetadata {
  clarification_id: string;
  doubt_text: string;
  inserted_at_index: number;
  step_count: number;
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, I identified several opportunities to consolidate redundant properties:

- **Input validation properties (1.1, 1.3)** can be combined into a single comprehensive validation property
- **Fallback behavior properties (2.4, 6.2, 12.1, 12.3)** follow the same pattern and can be consolidated
- **Data structure validation properties (2.3, 7.2, 4.2, 4.7)** can be combined into schema validation properties
- **Storage behavior properties (6.4, 7.3, 7.4)** can be unified into asset persistence properties
- **Sanitization properties (5.2, 5.3, 5.4)** are all aspects of the same sanitization process
- **Logging properties (11.1-11.6)** can be consolidated into event logging properties

The following properties represent the unique, non-redundant validation requirements:

### Property 1: Input Validation Completeness

*For any* lesson request with topic, skill_level, and language parameters, the system should validate all parameters and either accept valid inputs (initiating workflow) or reject invalid inputs (returning descriptive errors).

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Cache Key Determinism

*For any* topic, skill_level, and language combination, computing the cache key multiple times should always produce the same result.

**Validates: Requirements 3.1**

### Property 3: Cache-First Strategy

*For any* lesson request, the system should check the cache before initiating generation, and cache hits should return cached artifacts without regeneration.

**Validates: Requirements 3.2, 3.3, 3.4, 15.3**

### Property 4: Cache Validation and Fallback

*For any* cached artifact, if validation fails or corruption is detected, the system should treat it as a cache miss and regenerate the lesson.

**Validates: Requirements 3.5, 3.6**

### Property 5: Teaching Plan Schema Compliance

*For any* generated Teaching_Plan, it should contain all required fields (lesson_id, topic, skill_level, language, steps array) and each step should have (step_id, title, narration_text, visual_spec, duration_estimate).

**Validates: Requirements 2.3, 7.2**

### Property 6: Teaching Plan Step Count Bounds

*For any* Teaching_Plan generated for typical topics, the number of Lesson_Steps should be between 3 and 12.

**Validates: Requirements 2.7**

### Property 7: Schema Validation with Retry

*For any* Teaching_Plan generation, if schema validation fails, the system should retry generation once before failing.

**Validates: Requirements 2.5, 2.6**

### Property 8: LLM Fallback Chain

*For any* planning request, if the primary LLM (Claude 3 Opus) is unavailable, the system should automatically fall back to Amazon Nova Pro.

**Validates: Requirements 2.4, 12.1**

### Property 9: SVG Well-Formedness

*For any* generated SVG, the output should be well-formed XML that can be parsed without errors.

**Validates: Requirements 4.3**

### Property 10: SVG Size Constraint with Adaptive Simplification

*For any* generated SVG, if the size exceeds 200 KB, the system should simplify the visual specification and regenerate until the size is under 200 KB.

**Validates: Requirements 4.4, 4.5**

### Property 11: SVG Metadata Completeness

*For any* generated SVG, it should contain tts_meta attributes (data-tts-start, data-tts-end) for synchronization and aria-label attributes for accessibility.

**Validates: Requirements 4.2, 4.7, 14.1**

### Property 12: SVG Semantic Identifiers

*For any* generated SVG, all elements should have semantic IDs following the pattern `{step_id}-{element_type}-{element_name}`.

**Validates: Requirements 4.6**

### Property 13: SVG Sanitization Round-Trip

*For any* valid SVG markup, sanitizing it should return valid SVG markup that preserves essential attributes (tts_meta, aria-label) while removing unsafe content.

**Validates: Requirements 5.6**

### Property 14: Sanitization Security Enforcement

*For any* SVG containing script tags, event handlers, or external resource references, the sanitizer should remove all unsafe elements and attributes.

**Validates: Requirements 5.2, 5.3, 5.4**

### Property 15: Sanitization Whitelist Compliance

*For any* sanitized SVG, all elements and attributes should be from the allowed whitelist, and no forbidden patterns should be present.

**Validates: Requirements 5.3**

### Property 16: Sanitization Attribute Preservation

*For any* SVG with tts_meta and aria-label attributes, sanitization should preserve these attributes in the output.

**Validates: Requirements 5.5**

### Property 17: TTS Fallback Chain

*For any* TTS request, if Sarvam API is unavailable or fails, the system should automatically fall back to Amazon Polly.

**Validates: Requirements 6.2, 12.3**

### Property 18: TTS Audio Format Compliance

*For any* generated audio file, it should be in MP3 format with 64 kbps bitrate and include timing metadata for synchronization.

**Validates: Requirements 6.3, 6.6**

### Property 19: TTS Asset Storage and CDN

*For any* generated audio, the system should upload it to S3 and return a valid CloudFront CDN URL.

**Validates: Requirements 6.4, 6.5**

### Property 20: TTS Audio Size Constraint

*For any* generated audio file for a Lesson_Step, the file size should be less than 500 KB.

**Validates: Requirements 6.7**

### Property 21: Lesson Manifest Assembly Completeness

*For any* lesson where all steps have SVG and audio assets, the system should assemble a complete manifest with all required fields and CDN URLs.

**Validates: Requirements 7.1, 7.5**

### Property 22: Asset Persistence

*For any* generated lesson, all SVG and audio assets should be stored in S3, and the manifest should be stored in DynamoDB with the correct cache key.

**Validates: Requirements 7.3, 7.4**

### Property 23: Session Playback State Transitions

*For any* session, play should start rendering, pause should halt playback, and resume should continue from the paused position.

**Validates: Requirements 8.1, 8.3, 8.4**

### Property 24: Audio-Visual Synchronization

*For any* active Lesson_Step, SVG animations should be synchronized with TTS audio playback using timing metadata.

**Validates: Requirements 8.2**

### Property 25: Automatic Step Progression

*For any* Lesson_Step that completes playback, the system should automatically advance to the next step in the timeline.

**Validates: Requirements 8.5**

### Property 26: Step Navigation

*For any* session with multiple steps, navigation controls should allow jumping to any specific step by index.

**Validates: Requirements 8.6**

### Property 27: Doubt Submission Pauses Session

*For any* active session, submitting a doubt should pause the current playback.

**Validates: Requirements 9.1**

### Property 28: Clarification Plan Generation

*For any* doubt submission, the system should generate a focused Teaching_Plan containing 1 to 3 Lesson_Steps that address the specific doubt.

**Validates: Requirements 9.2, 9.3**

### Property 29: Clarification Timeline Insertion

*For any* generated clarification, the system should insert the Clarification_Sequence into the Session_Timeline and resume playback with the clarification before continuing the original lesson.

**Validates: Requirements 9.5, 9.6**

### Property 30: Clarification Context Preservation

*For any* clarification generation, the system should maintain context from the original lesson (completed steps, current position).

**Validates: Requirements 9.7**

### Property 31: Lesson Export Completeness

*For any* lesson export request, the system should package all SVG files, audio files, manifest JSON, and a standalone HTML player into a ZIP archive.

**Validates: Requirements 10.1, 10.2, 10.3**

### Property 32: Export Link Generation with TTL

*For any* export request, the system should generate a download link that is valid for 24 hours.

**Validates: Requirements 10.4**

### Property 33: Export Package Size Constraint

*For any* typical lesson export, the ZIP archive should be less than 5 MB.

**Validates: Requirements 10.5**

### Property 34: Event Logging Completeness

*For any* system event (lesson request, generation complete, doubt submission, error), the system should log the event with all required contextual data to CloudWatch.

**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.6**

### Property 35: Cache Metrics Tracking

*For any* cache operation (hit or miss), the system should track the result and report cache hit rate metrics.

**Validates: Requirements 11.5**

### Property 36: Cascading Fallback Exhaustion

*For any* request where all fallback options fail (Bedrock → Nova, Sarvam → Polly), the system should return an error message with retry guidance.

**Validates: Requirements 12.2**

### Property 37: SVG Generation Retry with Simplification

*For any* SVG generation failure, the system should retry once with a simplified visual_spec before failing.

**Validates: Requirements 12.4**

### Property 38: Partial Lesson on Total Failure

*For any* lesson generation where some steps succeed but others fail after retries, the system should return a partial lesson with available steps.

**Validates: Requirements 12.5**

### Property 39: Error Logging for Debugging

*For any* error occurrence, the system should log error details (type, message, stack trace) for debugging and system improvement.

**Validates: Requirements 12.6**

### Property 40: Content Moderation Filtering

*For any* generated content, the system should apply moderation filters and reject lessons containing inappropriate content.

**Validates: Requirements 13.1, 13.4**

### Property 41: Input Injection Prevention

*For any* user input, the system should validate and sanitize to prevent injection attacks (SQL, XSS, command injection).

**Validates: Requirements 13.5**

### Property 42: Keyboard Navigation Support

*For any* playback control, the system should support keyboard navigation for accessibility.

**Validates: Requirements 14.2**

### Property 43: Screen Reader Announcements

*For any* lesson step transition, the system should trigger screen reader announcements.

**Validates: Requirements 14.3**

### Property 44: Transcript Availability

*For any* lesson with audio narration, the system should provide text transcripts alongside the audio.

**Validates: Requirements 14.4**

### Property 45: WCAG Contrast Compliance

*For any* text element in generated SVG, the contrast ratio should meet WCAG 2.1 Level AA requirements (4.5:1 for normal text, 3:1 for large text).

**Validates: Requirements 14.5**

## Error Handling

### Error Categories

1. **Input Validation Errors**
   - Invalid topic (empty, too long, inappropriate)
   - Invalid skill_level (not in: beginner, intermediate, advanced)
   - Invalid language (not in: en, hi, ta)
   - Response: 400 Bad Request with descriptive error message

2. **LLM Service Errors**
   - Bedrock unavailable → Fall back to Nova Pro
   - Nova Pro unavailable → Return 503 Service Unavailable
   - Timeout (> 5s) → Retry once, then fail
   - Invalid response format → Retry once with clarified prompt

3. **TTS Service Errors**
   - Sarvam API unavailable → Fall back to Amazon Polly
   - Polly unavailable → Return 503 Service Unavailable
   - Audio generation timeout → Retry once, then fail

4. **SVG Generation Errors**
   - Size exceeds 200 KB → Simplify visual_spec and retry
   - Invalid XML → Retry with simplified spec
   - Sanitization failure → Log error, reject lesson

5. **Storage Errors**
   - S3 upload failure → Retry 3 times with exponential backoff
   - DynamoDB write failure → Retry 3 times, then proceed without caching
   - Cache corruption → Treat as cache miss, regenerate

6. **Session Errors**
   - Invalid session_id → Return 404 Not Found
   - Doubt submission during non-active session → Return 400 Bad Request
   - Timeline manipulation failure → Log error, continue with original timeline

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description",
    "details": {
      "field": "specific_field_name",
      "reason": "detailed_reason"
    },
    "retry_guidance": "Suggested action for user",
    "request_id": "uuid"
  }
}
```

### Retry Strategies

- **LLM calls**: 1 retry with 2s delay
- **TTS calls**: 1 retry with 1s delay
- **S3 uploads**: 3 retries with exponential backoff (1s, 2s, 4s)
- **DynamoDB operations**: 3 retries with exponential backoff
- **SVG generation**: 1 retry with simplified spec

### Circuit Breaker Pattern

Implement circuit breakers for external services:
- **Threshold**: 5 consecutive failures
- **Timeout**: 30 seconds
- **Half-open test**: Single request after timeout
- **Services**: Bedrock, Nova, Sarvam, Polly

## Testing Strategy

### Dual Testing Approach

The Kydy system requires both unit testing and property-based testing for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Both approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across the input space.

### Property-Based Testing Configuration

**Library Selection**:
- **Python**: Use `hypothesis` library for property-based testing
- **Minimum iterations**: 100 per property test (due to randomization)
- **Test tagging**: Each property test must reference its design document property

**Tag Format**:
```python
@given(...)
def test_property_name(...):
    """
    Feature: kydy-adaptive-ai-tutor, Property 1: Input Validation Completeness
    
    For any lesson request with topic, skill_level, and language parameters,
    the system should validate all parameters and either accept valid inputs
    or reject invalid inputs with descriptive errors.
    """
```

### Unit Testing Focus Areas

Unit tests should focus on:

1. **Specific Examples**
   - Valid lesson request with "Photosynthesis", "beginner", "en"
   - Valid lesson request with "Calculus", "advanced", "hi"
   - Cache hit scenario with known cache_key

2. **Edge Cases**
   - Empty topic string
   - Topic with special characters
   - Maximum length topic (1000 characters)
   - Lesson with exactly 3 steps (minimum)
   - Lesson with exactly 12 steps (maximum)
   - SVG at exactly 200 KB size limit
   - Audio at exactly 500 KB size limit

3. **Error Conditions**
   - Bedrock returns malformed JSON
   - S3 upload fails after 3 retries
   - Sanitizer detects script injection
   - Cache contains corrupted manifest
   - Doubt submitted with empty text

4. **Integration Points**
   - CrewAI agent tool invocation
   - Bedrock API call with correct parameters
   - S3 upload with correct bucket and key
   - DynamoDB query with correct cache_key
   - CloudWatch log entry format

### Property-Based Testing Focus Areas

Property tests should focus on:

1. **Input Validation** (Properties 1, 41)
   - Generate random valid and invalid inputs
   - Verify validation logic is consistent

2. **Deterministic Operations** (Property 2)
   - Generate random topic/skill/language combinations
   - Verify cache keys are deterministic

3. **Data Structure Compliance** (Properties 5, 11, 21)
   - Generate random Teaching_Plans
   - Verify all required fields are present

4. **Size Constraints** (Properties 10, 20, 33)
   - Generate random content
   - Verify size limits are enforced

5. **Round-Trip Properties** (Property 13)
   - Generate random valid SVGs
   - Verify sanitization preserves validity

6. **Fallback Chains** (Properties 8, 17)
   - Simulate random service failures
   - Verify fallback logic is triggered

7. **State Transitions** (Property 23)
   - Generate random session state sequences
   - Verify transitions are correct

### Test Coverage Goals

- **Unit test coverage**: > 80% line coverage
- **Property test coverage**: All 45 properties implemented
- **Integration test coverage**: All tool interactions tested
- **End-to-end test coverage**: 10 golden lesson scenarios

### Golden Lesson Test Suite

Create 10 representative lessons for regression testing:

1. **Simple Science**: "Photosynthesis" (beginner, en)
2. **Math Concept**: "Quadratic Equations" (intermediate, en)
3. **Advanced Topic**: "Quantum Entanglement" (advanced, en)
4. **Hindi Lesson**: "भारतीय संविधान" (intermediate, hi)
5. **Tamil Lesson**: "தமிழ் இலக்கணம்" (beginner, ta)
6. **Visual-Heavy**: "Solar System" (beginner, en)
7. **Abstract Concept**: "Recursion in Programming" (intermediate, en)
8. **Historical Topic**: "World War II" (advanced, en)
9. **Minimal Steps**: "Binary Numbers" (beginner, en) - 3 steps
10. **Maximum Steps**: "Complete Guide to Photosynthesis" (advanced, en) - 12 steps

Each golden lesson should:
- Generate successfully within 8 seconds
- Have all assets < size limits
- Pass all sanitization checks
- Be cached for reuse
- Support doubt resolution

### Continuous Integration

- Run unit tests on every commit
- Run property tests on every pull request
- Run golden lesson suite nightly
- Monitor test execution time (< 5 minutes total)
- Fail build on any test failure

### Performance Benchmarks

While not unit tests, these benchmarks should be tracked:

- **Lesson generation latency**: p50, p95, p99
- **Cache hit rate**: Daily percentage
- **TTS provider distribution**: Sarvam vs Polly usage
- **Asset sizes**: Average SVG size, average audio size
- **Error rates**: By error category
- **Fallback frequency**: How often fallbacks are triggered

## Deployment Architecture

### Prototype Deployment

**Infrastructure**:
- **Compute**: AWS Lambda functions (Python 3.11 runtime)
- **API**: Amazon API Gateway (REST API)
- **Storage**: S3 bucket with CloudFront distribution
- **Database**: DynamoDB table (on-demand billing)
- **Secrets**: AWS Secrets Manager
- **Monitoring**: CloudWatch Logs and Metrics

**Lambda Functions**:
1. **lesson-generator**: Main orchestrator with CrewAI agent
   - Memory: 3 GB
   - Timeout: 30 seconds
   - Concurrency: 100

2. **doubt-resolver**: Handles clarification requests
   - Memory: 2 GB
   - Timeout: 20 seconds
   - Concurrency: 50

**API Endpoints**:
```
POST /api/v1/lessons
  - Request: {topic, skill_level, language}
  - Response: LessonManifest

GET /api/v1/lessons/{lesson_id}
  - Response: LessonManifest

POST /api/v1/sessions/{session_id}/doubts
  - Request: {doubt_text, current_step_id}
  - Response: ClarificationResponse

POST /api/v1/lessons/{lesson_id}/export
  - Response: {download_url, expires_at}
```

### Production Deployment Strategy

**Phase 1: Fine-Tuning** (Months 1-2)
- Collect 1000+ high-quality lesson examples
- Fine-tune open multimodal model (e.g., LLaVA, Qwen-VL) on SageMaker
- Use LoRA/QLoRA for efficient fine-tuning
- Target: 90% success rate on golden lesson suite

**Phase 2: Self-Hosted Endpoints** (Month 3)
- Deploy fine-tuned model on SageMaker endpoints
- Replace Bedrock calls with self-hosted inference
- Implement model versioning and A/B testing
- Target: < 3s inference latency

**Phase 3: Optimization** (Month 4+)
- Implement request batching for efficiency
- Add model quantization (INT8) for faster inference
- Deploy regional endpoints for global latency
- Implement advanced caching strategies

### Security Hardening

**IAM Roles**:
- **lesson-generator-role**: Bedrock, S3, DynamoDB, Secrets Manager (read-only)
- **doubt-resolver-role**: Bedrock, S3, DynamoDB (read-only)
- **cloudfront-role**: S3 (read-only)

**Secrets Management**:
- Store Sarvam API key in Secrets Manager
- Rotate secrets every 90 days
- Use IAM roles for AWS service authentication

**Content Security**:
- Implement AWS Comprehend for content moderation
- Block inappropriate topics at input validation
- Log all moderation events for review

**Network Security**:
- API Gateway with AWS WAF rules
- Rate limiting: 10 requests/minute per IP
- DDoS protection via CloudFront
- VPC endpoints for internal service communication

## Appendix: Sample Prompts

### Planner Prompt for Initial Lesson

```
You are an expert educator creating a visual lesson plan.

Topic: Photosynthesis
Skill Level: beginner
Language: en

Generate a structured teaching plan with 5-8 steps. Each step should:
1. Have a clear learning objective
2. Include narration text (2-4 sentences) in English
3. Specify visual elements (diagrams, graphs, animations)
4. Build on previous steps logically

Output valid JSON matching this schema:
{
  "lesson_id": "uuid",
  "topic": "string",
  "skill_level": "beginner",
  "language": "en",
  "steps": [
    {
      "step_id": "step-1",
      "title": "Introduction to Photosynthesis",
      "narration_text": "Photosynthesis is the process by which plants convert sunlight into energy. This amazing process happens in the chloroplasts of plant cells. Let's explore how it works step by step.",
      "visual_spec": {
        "type": "diagram",
        "elements": ["plant cell", "chloroplast", "sunlight rays"],
        "layout": "centered with labels"
      },
      "duration_estimate": 15
    }
  ],
  "total_duration": 90
}

Focus on visual explanations that can be rendered as SVG diagrams.
Make the content appropriate for beginners with no prior knowledge.
```

### Planner Prompt for Doubt Clarification

```
You are an expert educator addressing a student's confusion.

Original Lesson Topic: Photosynthesis
Current Step: "Light-Dependent Reactions"
Student Doubt: "I don't understand what happens to the water molecules"

Context from lesson:
- Student has completed steps 1-3 (Introduction, Chloroplast Structure, Light Absorption)
- Currently on step 4 (Light-Dependent Reactions)
- Student is at beginner level

Generate a focused clarification plan with 1-3 steps that:
1. Directly addresses the specific confusion about water molecules
2. Uses simple language appropriate for beginners
3. Includes visual diagrams showing water molecule splitting
4. Connects back to the original lesson context

Output valid JSON with the same Teaching_Plan schema.
Keep the clarification concise and targeted.
```

### SVG Generator Prompt

```
Generate SVG markup for this visual specification:

Step ID: step-4
Title: "Light-Dependent Reactions"
Visual Spec:
{
  "type": "diagram",
  "elements": [
    "thylakoid membrane",
    "water molecules (H2O)",
    "oxygen molecules (O2)",
    "electron flow arrows",
    "ATP and NADPH molecules"
  ],
  "layout": "cross-section view with labeled components"
}

Narration Text: "In the light-dependent reactions, water molecules are split by light energy. This releases oxygen as a byproduct and provides electrons that flow through the electron transport chain. The energy from this process is used to create ATP and NADPH, which will power the next stage."

Requirements:
1. Generate valid SVG with viewBox="0 0 800 600"
2. Use semantic IDs: step-4-thylakoid, step-4-water, etc.
3. Add data-tts-start and data-tts-end attributes for synchronization
4. Include aria-label attributes for accessibility
5. Use clear colors and labels
6. Keep total size under 200 KB
7. Make it visually clear and educational

Output only the SVG markup, no explanations.
```
