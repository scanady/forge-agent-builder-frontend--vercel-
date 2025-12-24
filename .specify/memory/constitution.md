## Core Principles

### I. Code Quality & Maintainability

**All code MUST adhere to the following non-negotiable standards:**

- **Clean Code**: Code MUST be self-documenting with clear naming conventions. Variables, methods, and classes MUST use descriptive names that convey intent without requiring inline comments.
- **SOLID Principles**: Services and components MUST follow Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles.
- **DRY (Don't Repeat Yourself)**: Code duplication MUST be eliminated through abstraction, shared libraries, or utility functions. Duplicate logic blocks exceeding 3 lines require refactoring.
- **Code Reviews**: All code changes MUST undergo peer review by at least one team member with domain expertise before merging.
- **Static Analysis**: Code MUST pass automated linting and static analysis tools (e.g., SonarQube, ESLint, Checkstyle) with zero critical violations.
- **Documentation**: Public APIs, service interfaces, and complex algorithms MUST include comprehensive documentation explaining purpose, parameters, return values, and side effects.

**Rationale**: High-quality code reduces technical debt, improves team velocity, and ensures the platform remains maintainable as it scales. Insurance systems require long-term reliability and auditability.

### II. Test-Driven Development (NON-NEGOTIABLE)

**Test-First development is MANDATORY for all feature work:**

- **Red-Green-Refactor Cycle**: Tests MUST be written first, verified to fail (red), then implementation makes them pass (green), followed by refactoring for quality.
- **Test Coverage**: Minimum 80% code coverage MUST be maintained across all services. Critical business logic (underwriting, pricing, claims) MUST achieve 95%+ coverage.
- **Test Pyramid**: Test suites MUST follow the pyramid structure: 70% unit tests, 20% integration tests, 10% end-to-end tests.
- **Contract Testing**: All inter-service communication MUST have contract tests verifying API compatibility using tools like Pact or Spring Cloud Contract.
- **Test Independence**: Tests MUST be independently runnable, idempotent, and not dependent on execution order or external state.
- **CI/CD Integration**: All tests MUST pass in the CI pipeline before code can be merged. Failing tests block deployments.

**Test Categories Required**:
- **Unit Tests**: Validate individual components, methods, and business logic in isolation
- **Integration Tests**: Verify interactions between services, databases, and external systems
- **Contract Tests**: Ensure API backward compatibility and inter-service communication
- **Performance Tests**: Validate response times and throughput meet SLA requirements
- **Security Tests**: Verify authentication, authorization, and data protection mechanisms

**Rationale**: Insurance systems handle sensitive financial data and life-critical decisions. TDD ensures correctness, prevents regressions, and provides living documentation of system behavior.

### III. User Experience Consistency

**User interfaces and APIs MUST provide consistent, intuitive experiences:**

- **Design System**: All UI components MUST adhere to the OpenLife design system with standardized colors, typography, spacing, and interaction patterns.
- **Accessibility**: MUST comply with WCAG 2.1 Level AA standards. All features MUST be keyboard-navigable and screen reader compatible.
- **Responsive Design**: UI components MUST function correctly across mobile (320px+), tablet (768px+), and desktop (1024px+) viewports.
- **Error Handling**: User-facing errors MUST provide clear, actionable guidance. Technical stack traces MUST never be exposed to end users.
- **API Consistency**: RESTful APIs MUST follow uniform naming conventions, response formats (JSON), error structures, and HTTP status codes.
- **Internationalization**: UI text MUST be externalized to support multiple languages. Date, currency, and number formats MUST respect user locale.
- **Loading States**: All asynchronous operations MUST provide visual feedback (spinners, progress bars) within 100ms of user action.

**Rationale**: Consistent UX reduces cognitive load, improves agent productivity, and ensures accessibility for all users. Insurance workflows are complex; predictable interfaces minimize errors.

### IV. Performance & Scalability

**System performance MUST meet the following Service Level Agreements (SLAs):**

- **Response Time**: 
  - API endpoints: p95 < 200ms for read operations, < 500ms for write operations
  - UI page load: First Contentful Paint < 1.5s, Time to Interactive < 3.0s
  - Batch processes: Complete within defined maintenance windows
- **Throughput**: System MUST handle 1,000 concurrent users and 10,000 transactions per hour per service with auto-scaling enabled.
- **Database Performance**: Queries MUST execute in < 100ms for indexed lookups, < 1s for complex analytics queries. Use read replicas and caching strategically.
- **Resource Efficiency**: Services MUST operate within defined resource limits: < 512MB memory baseline, < 2GB under load, < 70% CPU utilization average.
- **Caching Strategy**: Frequently accessed, slowly changing data (product definitions, rate tables) MUST be cached with appropriate TTLs and cache invalidation strategies.
- **Async Processing**: Long-running operations (underwriting workflows, document generation, batch calculations) MUST use asynchronous processing with status tracking and notifications.

**Performance Testing Requirements**:
- Load tests MUST be executed for all major releases using production-like data volumes
- Performance regression tests MUST run in CI/CD for critical paths
- APM (Application Performance Monitoring) tools MUST be integrated to track real-time performance

**Rationale**: Insurance operations require high availability and responsiveness. Performance degradation impacts agent productivity, customer satisfaction, and regulatory compliance.

### V. API-First Design

**All services MUST be designed with API contracts as the primary interface:**

- **OpenAPI Specification**: Every service MUST define its API contract using OpenAPI 3.0+ before implementation begins.
- **RESTful Standards**: APIs MUST follow REST principles: resource-based URLs, standard HTTP methods (GET, POST, PUT, PATCH, DELETE), appropriate status codes.
- **Versioning**: API versions MUST be explicit in the URL path (e.g., `/api/v1/policies`). Breaking changes require major version increments.
- **Pagination**: List endpoints MUST implement cursor-based or offset pagination with configurable page sizes (default 20, max 100).
- **Filtering & Sorting**: List endpoints MUST support query parameters for filtering and sorting to reduce data transfer and client-side processing.
- **Rate Limiting**: APIs MUST implement rate limiting to prevent abuse (default: 1000 requests/minute per client).
- **API Gateway**: All external API access MUST flow through the API Gateway for unified authentication, rate limiting, and monitoring.

**Rationale**: API-first design enables parallel development, third-party integrations, and future extensibility. Insurance platforms must support diverse channels (web, mobile, partner systems).

### VI. Security & Compliance

**Security MUST be embedded in every layer of the system:**

- **Authentication**: OAuth2 with JWT tokens MUST be used for all inter-service and external authentication. Tokens expire in 1 hour; refresh tokens in 24 hours.
- **Authorization**: Role-Based Access Control (RBAC) MUST enforce principle of least privilege. Permissions checked at API gateway and service boundaries.
- **Data Protection**: Personally Identifiable Information (PII) MUST be encrypted at rest (AES-256) and in transit (TLS 1.3). Database columns containing SSN, financial data MUST use field-level encryption.
- **Audit Logging**: All data access, modifications, and security events MUST be logged with user identity, timestamp, resource, and action. Logs retained for 7 years.
- **Input Validation**: All user input MUST be validated and sanitized to prevent injection attacks (SQL, XSS, LDAP). Use parameterized queries and prepared statements.
- **Secrets Management**: Credentials, API keys, and certificates MUST be stored in secure vaults (e.g., HashiCorp Vault, AWS Secrets Manager). Never commit secrets to version control.
- **Dependency Scanning**: Third-party dependencies MUST be scanned for known vulnerabilities. Critical CVEs MUST be patched within 7 days.

**Rationale**: Insurance data is highly regulated (HIPAA, GDPR, state insurance regulations). Security breaches risk customer trust, regulatory penalties, and business viability.

### VII. Observability & Monitoring

**Systems MUST be designed for operational transparency and rapid troubleshooting:**

- **Structured Logging**: All logs MUST use JSON format with consistent fields: timestamp, severity, service, trace_id, user_id, message, context. Use centralized logging (e.g., ELK, Splunk).
- **Distributed Tracing**: All inter-service calls MUST include trace context propagation (OpenTelemetry/Jaeger) enabling end-to-end request tracking.
- **Metrics & Alerting**: Services MUST expose Prometheus-compatible metrics for request rates, error rates, latency (RED), and resource utilization. Alerts configured for SLA violations.
- **Health Checks**: All services MUST expose `/health` and `/ready` endpoints for orchestration. Health checks MUST verify dependencies (database, message queue, external APIs).
- **Dashboards**: Each service MUST have operational dashboards displaying key metrics, error rates, and business KPIs (policies issued, claims processed, etc.).
- **Incident Response**: On-call runbooks MUST be maintained with escalation procedures, common issues, and resolution steps.

**Rationale**: Complex microservices architectures require comprehensive observability to diagnose issues quickly, minimize downtime, and ensure SLA compliance.

### VIII. Microservices Architecture

**The platform MUST follow microservices architectural principles to ensure flexibility, scalability, and maintainability:**

- **Bounded Contexts**: Each microservice MUST represent a distinct business capability or bounded context (Domain-Driven Design). Services MUST NOT overlap in business responsibility.
- **Service Autonomy**: Services MUST be independently deployable, scalable, and maintainable. No service should require coordinated deployment with another service for routine changes.
- **API Contracts**: All inter-service communication MUST occur through well-defined APIs with OpenAPI specifications. Direct database access across services is strictly prohibited.
- **Event-Driven Communication**: Services MUST use asynchronous event-driven patterns (publish/subscribe) for cross-capability communication and workflows. Events MUST be immutable and carry sufficient context.
- **Data Ownership**: Each service MUST own its data exclusively. Database schemas MUST NOT be shared between services. Use API calls or events to access data owned by other services.
- **Service Discovery**: Services MUST register with service registry (e.g., Consul, Eureka) for dynamic discovery. Hard-coded service endpoints are prohibited in production.
- **Circuit Breakers**: All inter-service calls MUST implement circuit breaker patterns (e.g., Resilience4j, Hystrix) to prevent cascading failures.
- **Fault Tolerance**: Services MUST gracefully handle downstream service failures with appropriate fallbacks, retries with exponential backoff, and timeout configurations.
- **Service Versioning**: API versions MUST be maintained for backward compatibility. Breaking changes require new major version endpoints running in parallel during migration periods.
- **Database per Service**: Each service MUST have its own database instance or schema. Shared databases between services violate service autonomy and create tight coupling.

**Integration Patterns Required**:
- **Synchronous**: RESTful HTTP APIs for request/response patterns (queries, commands requiring immediate feedback)
- **Asynchronous**: Message queues (RabbitMQ, Kafka, Azure Service Bus) for event-driven workflows and long-running processes
- **API Gateway**: All external client access MUST route through API Gateway providing authentication, rate limiting, routing, and composition

**Service Design Standards**:
- Services MUST be organized by business capability (Policy, Underwriting, Claims, Billing, etc.) not technical layers
- Each service MUST expose health checks (`/health`, `/ready`) for orchestration and monitoring
- Services MUST implement correlation ID propagation for distributed tracing across service boundaries
- Maximum service size: If a service grows beyond 50K lines of code or handles 5+ distinct business entities, consider decomposition

**Anti-Patterns to Avoid**:
- Distributed monoliths (services that must be deployed together)
- Shared database across multiple services
- Synchronous cascading service calls (A→B→C→D chains)
- Direct inter-service database queries
- Services organized by technical layers rather than business capabilities

**Rationale**: Microservices architecture enables independent team velocity, technology flexibility, fault isolation, and horizontal scalability. Insurance domains have natural bounded contexts (policy lifecycle, underwriting, claims, billing) that align with microservices design. Well-defined APIs and event-driven patterns ensure the system remains flexible, scalable, extensible, and easily integratable with external systems.

**Key References**:
- **Domain-Driven Design** (Eric Evans): Bounded Context patterns and strategic design principles
- **Building Microservices** (Sam Newman): Service decomposition, communication patterns, data management
- **Microservices Patterns** (Chris Richardson): Saga pattern for distributed transactions, API Gateway, Service Mesh
- **The Twelve-Factor App** (https://12factor.net): Configuration, backing services, port binding, concurrency, disposability
- **Martin Fowler's Microservices Guide** (https://martinfowler.com/microservices): Foundational patterns and trade-offs
- **Release It!** (Michael Nygard): Circuit breakers, bulkheads, timeouts, and stability patterns
- **Cloud Native Patterns** (Cornelia Davis): Container orchestration, service discovery, configuration management
- **Enterprise Integration Patterns** (Gregor Hohpe): Messaging patterns, event-driven architecture, integration styles

## Performance Standards

**The following performance benchmarks are MANDATORY for production deployments:**

| Metric Category | Requirement | Measurement Method |
|-----------------|-------------|-------------------|
| API Response Time | p50 < 100ms, p95 < 200ms, p99 < 500ms | APM tools (New Relic, DataDog) |
| Database Queries | < 100ms for indexed, < 1s for complex | Query profiling, slow query logs |
| UI Load Time | FCP < 1.5s, TTI < 3.0s | Lighthouse CI, WebPageTest |
| Throughput | 10,000 transactions/hour/service | Load testing (JMeter, Gatling) |
| Availability | 99.9% uptime (< 8.76 hours downtime/year) | Uptime monitoring (Pingdom, UptimeRobot) |
| Error Rate | < 0.1% of requests result in 5xx errors | Application logs, APM error tracking |
| Resource Utilization | CPU < 70%, Memory < 80%, Disk < 80% | Container metrics (Prometheus) |

**Performance Optimization Requirements**:
- Database indexes MUST be added for all frequently queried fields
- N+1 query problems MUST be eliminated using eager loading or batch queries
- Large datasets MUST use pagination; never load unbounded result sets
- Static assets MUST be served via CDN with appropriate cache headers
- Images MUST be optimized and use responsive formats (WebP with JPEG fallback)

## Quality Gates

**Code MUST pass the following automated quality gates before deployment:**

### Pre-Commit Gates (Local Development)
- [ ] Code formatting verified (Prettier, Black, gofmt)
- [ ] Linting rules pass with zero errors
- [ ] Unit tests pass with 80%+ coverage
- [ ] No secrets detected (git-secrets, truffleHog)

### Pull Request Gates (CI Pipeline)
- [ ] All automated tests pass (unit, integration, contract)
- [ ] Code coverage maintained or improved (no regressions)
- [ ] Static security analysis passes (SAST tools)
- [ ] Dependency vulnerability scan clean (no critical/high CVEs)
- [ ] Performance regression tests pass
- [ ] API contract validation succeeds
- [ ] Documentation updated for API changes

### Deployment Gates (CD Pipeline)
- [ ] Integration tests pass in staging environment
- [ ] Performance tests meet SLA benchmarks
- [ ] Security penetration tests pass (quarterly)
- [ ] Manual QA sign-off for high-risk changes
- [ ] Rollback plan documented and tested
- [ ] Database migration scripts tested on staging data

**Gate Failure Protocol**:
- Critical failures (security, data loss risk) MUST block deployment immediately
- Test failures trigger automated rollback of deployment
- Gate bypasses require explicit approval from tech lead with documented justification

## Development Workflow

**All feature development MUST follow this standardized workflow:**

1. **Feature Specification**: Create detailed spec in `/specs/[###-feature-name]/spec.md` with user stories, acceptance criteria, and requirements.
2. **Implementation Planning**: Generate plan.md with architecture, dependencies, and task breakdown.
3. **Test Definition**: Write comprehensive test suite covering all acceptance criteria BEFORE implementation.
4. **Implementation**: Develop feature following TDD red-green-refactor cycle.
5. **Code Review**: Submit PR with tests, implementation, and documentation for peer review.
6. **Quality Validation**: Ensure all quality gates pass before merging.
7. **Deployment**: Deploy to staging → production with monitoring and rollback readiness.

**Branch Strategy**:
- `main`: Production-ready code, always deployable
- `feature/###-name`: Feature development branches from main
- `hotfix/###-name`: Critical production fixes
- PR required for all merges to main with minimum 1 approval

## Governance

**This constitution supersedes all other development practices and policies.**

### Amendment Procedure
- Constitution changes MUST be proposed via PR to `.specify/memory/constitution.md`
- Amendments require approval from 2+ senior engineers and product owner
- Major version increments (breaking changes to principles) require team-wide review
- All amendments MUST include:
  - Rationale for the change
  - Impact assessment on existing code and practices
  - Migration plan for non-compliant code
  - Updated documentation and templates

### Versioning Policy
- **MAJOR** (x.0.0): Backward incompatible principle removals or redefinitions requiring code changes
- **MINOR** (0.x.0): New principles added, materially expanded guidance, or new quality gates
- **PATCH** (0.0.x): Clarifications, wording improvements, typo fixes, formatting updates

### Compliance Review
- Constitution compliance MUST be reviewed quarterly by engineering leadership
- Non-compliant code MUST be remediated within agreed-upon timelines
- Repeated violations trigger architecture review and technical debt planning
- New team members MUST be onboarded to constitution within first week

### Exception Process
- Exceptions to principles require written justification and tech lead approval
- Exceptions MUST be time-limited with remediation plans
- Security and testing principles have NO exceptions except for prototypes explicitly marked as non-production

**Version**: 1.1.0 | **Ratified**: 2025-11-01 | **Last Amended**: 2025-11-01
