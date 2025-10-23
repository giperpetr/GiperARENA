<!--
SYNC IMPACT REPORT
==================
Version: 0.0.0 → 1.0.0 (Initial constitution creation)
Ratification: 2025-10-21
Last Amended: 2025-10-21

CHANGES:
- Initial constitution created for ArenaHUB project
- 8 core principles defined covering technology stack through documentation
- Technology Stack requirements specified (Supabase, Solana, Next.js, React Native)
- Architecture Principles established (microservices, API-first, event-driven, blockchain-first)
- Quality Standards defined (80% test coverage, TypeScript strict mode, code review)
- Security Requirements established (authentication, rate limiting, encryption, GDPR)
- Performance Standards set (<200ms API, <100ms WebRTC, 10k concurrent users)
- User Experience principles defined (mobile-first, WCAG 2.1 AA, multilingual)
- Blockchain Principles specified (smart contracts, transparency, DAO, NFTs)
- Documentation Requirements established (inline comments, OpenAPI, ADR, multilingual)

TEMPLATE ALIGNMENT:
✅ plan-template.md - Constitution Check section updated with ArenaHUB-specific compliance gates
✅ spec-template.md - Functional requirements align with security/performance standards
✅ tasks-template.md - Task categorization supports blockchain, real-time, and quality requirements

FOLLOW-UP TODOS:
- Ensure all future specifications include blockchain compliance checks in spec.md
- Add WebRTC/real-time performance validation reminders to tasks.md template
- Create ADR template in /docs/adr/ directory when first ADR is needed
-->

# ArenaHUB Constitution

## Core Principles

### I. Technology Stack Requirements

The ArenaHUB platform MUST utilize the following technology stack. Deviations require
architectural review and explicit justification in Architecture Decision Records (ADR).

**Backend Infrastructure:**
- Supabase for PostgreSQL 17 database, authentication, realtime subscriptions, and storage
- n8n for workflow automation and service integrations
- Redis for caching real-time data and session management
- Built-in monitoring tools for observability (Prometheus, Grafana, Loki, cAdvisor)
- Solana blockchain for smart contracts managing GAC/PAC tokens

**Frontend Stack:**
- Next.js 14+ with TypeScript for web application
- React Native with TypeScript for mobile applications (iOS/Android)
- WebRTC for low-latency device control and video streaming
- Zustand or Redux Toolkit for state management

**Rationale:** This stack provides enterprise-grade scalability, real-time capabilities,
blockchain integration, and cross-platform development efficiency. Supabase eliminates
infrastructure overhead while providing production-ready auth, database, and realtime.
Solana offers high-throughput, low-cost blockchain operations essential for gaming economics.

### II. Architecture Principles

ArenaHUB architecture MUST follow these patterns:

- **Microservices Architecture:** Services MUST have clear bounded contexts with well-defined
  interfaces. Each service owns its data and exposes functionality via documented APIs.

- **API-First Development:** All features MUST expose REST and/or GraphQL endpoints before
  UI implementation. API contracts MUST be versioned and documented via OpenAPI/GraphQL schema.

- **Event-Driven Real-Time:** Real-time features (game state, live betting, chat) MUST use
  event-driven architecture with Supabase Realtime and/or WebSocket connections.

- **Blockchain-First Financial Operations:** ALL financial transactions (token transfers,
  prize distribution, NFT operations, betting settlements) MUST execute through Solana
  smart contracts. Off-chain records are supplementary only.

- **Horizontal Scalability:** System MUST support horizontal scaling via containerization,
  stateless service design, and distributed caching. Architecture decisions MUST justify
  scalability impact.

**Rationale:** Microservices enable independent scaling and team autonomy. API-first ensures
consistent integration across web/mobile/third-party. Event-driven architecture provides the
low-latency real-time experience essential for robot control and competitive gaming.
Blockchain-first ensures transparency and decentralization of financial operations.

### III. Quality Standards (NON-NEGOTIABLE)

Code quality requirements are mandatory and enforced via CI/CD pipeline:

- **Test Coverage:** Minimum 80% code coverage for ALL critical modules (authentication,
  financial transactions, game logic, blockchain interactions, real-time control). Tests
  MUST include unit, integration, and contract tests. Coverage below 80% blocks deployment.

- **TypeScript Strict Mode:** ALL code (frontend, backend, mobile) MUST use TypeScript
  with strict mode enabled. No `any` types allowed without explicit justification and
  `@ts-expect-error` comment explaining why.

- **Code Style Enforcement:** ESLint and Prettier MUST be configured and enforced. All
  commits MUST pass linting. Configuration MUST be consistent across all projects.

- **Mandatory Code Review:** ALL code changes require peer review approval before merge.
  Reviewers MUST verify: (1) tests pass, (2) constitution compliance, (3) security
  considerations, (4) documentation completeness.

- **CI/CD Pipeline:** Automated pipeline MUST run on every PR: (1) lint checks, (2) type
  checks, (3) unit tests, (4) integration tests, (5) security scans. Failed checks block merge.

**Rationale:** High quality standards prevent technical debt in a complex system involving
blockchain, real-time control, and financial operations where bugs have severe consequences.
TypeScript strict mode catches errors at compile-time. Automated enforcement removes human
error from quality gates.

### IV. Security Requirements (NON-NEGOTIABLE)

Security is paramount given financial operations and user data:

- **Authentication Required:** ALL API endpoints MUST enforce authentication except explicitly
  public endpoints (health checks, public arena listings). Use Supabase Auth with JWT tokens.

- **Rate Limiting:** ALL public-facing endpoints MUST implement rate limiting to prevent abuse.
  Critical endpoints (authentication, financial operations) require stricter limits.

- **Data Encryption:** ALL sensitive data (user PII, wallet keys, financial records) MUST be
  encrypted at rest and in transit. Use industry-standard encryption (AES-256, TLS 1.3).

- **Smart Contract Audits:** ALL Solana smart contracts MUST undergo security audit before
  mainnet deployment. Audits MUST be repeated after material changes.

- **GDPR Compliance:** System MUST comply with GDPR for user data. Implement: right to access,
  right to deletion, data portability, consent management, data breach notification procedures.

**Rationale:** Financial operations and user data require defense-in-depth security. Rate
limiting prevents DoS attacks. Encryption protects user privacy. Smart contract audits prevent
financial exploits. GDPR compliance is legally required for EU users.

### V. Performance Standards

Performance targets are measurable and monitored:

- **API Response Time:** 95th percentile (p95) response time MUST be <200ms for all API
  endpoints under normal load. Critical real-time endpoints (game state updates) <100ms.

- **WebRTC Latency:** End-to-end latency for robot/drone control commands MUST be <100ms
  measured from user input to device response. Video streaming latency <150ms.

- **Concurrent Users:** System MUST support minimum 10,000 concurrent users without degradation.
  Architecture MUST scale horizontally to support growth.

- **Mobile Network Optimization:** Application MUST be optimized for 3G/4G networks. Implement:
  adaptive bitrate streaming, progressive content loading, offline-capable core features.

**Rationale:** Robot control requires near-real-time latency for safe operation. Competitive
gaming demands responsive interfaces. 10k concurrent users represents initial scale target.
Mobile optimization ensures global accessibility including emerging markets.

### VI. User Experience Principles

User experience standards guide all interface development:

- **Mobile-First Design:** ALL interfaces MUST be designed for mobile devices first, then
  adapted to desktop. Touch targets, navigation, layouts prioritize mobile ergonomics.

- **Accessibility (WCAG 2.1 AA):** ALL user interfaces MUST meet WCAG 2.1 Level AA standards.
  Include: keyboard navigation, screen reader support, color contrast, alt text, ARIA labels.

- **Multilingual Support:** Platform MUST support minimum 5 languages: Russian, English, Chinese
  (Simplified), Spanish, Portuguese. All UI text externalized via i18n framework. RTL support
  for future Arabic expansion.

- **Offline-First Critical Functions:** Core features (view match history, wallet balance,
  notifications) MUST work offline via local caching. Sync when connection restores.

- **Progressive Loading:** Content MUST load progressively. Show skeleton screens, lazy-load
  images, prioritize above-fold content. Time-to-interactive <3 seconds on 4G networks.

**Rationale:** Mobile-first ensures best experience for majority of users globally. Accessibility
is ethical imperative and legal requirement. Multilingual support enables global market expansion.
Offline-first improves reliability for users in areas with unstable connectivity. Progressive
loading improves perceived performance.

### VII. Blockchain Principles

Blockchain integration follows decentralization and transparency principles:

- **Smart Contract Financial Operations:** ALL financial transactions (deposits, withdrawals,
  prize distribution, betting settlements, NFT trades) MUST execute via audited Solana smart
  contracts. No off-chain financial state except for caching/display purposes.

- **Transparency via Blockchain Explorer:** ALL on-chain operations MUST be viewable via public
  Solana blockchain explorers. Provide direct links to transaction hashes for user verification.

- **Decentralized Governance (DAO):** Platform governance decisions (token economics changes,
  feature prioritization, treasury allocation) MUST be submitted to GAC token holder voting
  via DAO smart contracts.

- **NFT Digital Assets:** ALL digital assets with ownership (equipment, arena ownership,
  achievements, limited skins) MUST be implemented as Solana NFTs following Metaplex Token
  Metadata standard.

- **Multi-Signature Critical Operations:** Treasury movements, smart contract upgrades, and
  critical parameter changes MUST require multi-signature approval from project leadership.

**Rationale:** Smart contract execution ensures financial operations are transparent, auditable,
and tamper-proof. Blockchain explorer transparency builds trust. DAO governance aligns incentives
between team and community. NFTs enable true digital ownership and secondary markets.
Multi-signature prevents single points of failure.

### VIII. Documentation Requirements

Documentation is mandatory and maintained alongside code:

- **Inline Comments:** Complex business logic, algorithms, and non-obvious code MUST include
  inline comments explaining WHY, not WHAT. Focus on rationale and edge cases.

- **API Documentation:** ALL API endpoints MUST be documented via OpenAPI (Swagger) specification.
  Include: request/response schemas, authentication requirements, rate limits, error codes,
  example requests.

- **Architecture Decision Records (ADR):** Significant architectural decisions MUST be documented
  in ADR format. Include: context, decision, consequences, alternatives considered. Store in
  `/docs/adr/` directory.

- **Multilingual User Documentation:** User-facing documentation (help articles, tutorials, FAQs)
  MUST be available in all supported languages. Maintain translation parity for critical content.

**Rationale:** Inline comments help future developers (including yourself) understand complex
logic. OpenAPI documentation enables auto-generated clients and testing tools. ADRs provide
historical context for architectural decisions. Multilingual user docs support global user base.

## Development Workflow

### Code Review Process

ALL code changes MUST follow this review process:

1. **Pre-Review Checklist (Author):**
   - All tests pass locally
   - Code coverage meets 80% threshold
   - TypeScript strict mode passes
   - Linting passes (ESLint + Prettier)
   - Relevant documentation updated
   - Security implications considered and documented

2. **Review Requirements (Reviewer):**
   - Verify constitution principle compliance
   - Check security implications (especially for auth/financial/blockchain code)
   - Validate test coverage and test quality
   - Assess performance impact
   - Verify API documentation completeness
   - Check for code smells and maintainability

3. **Approval Gates:**
   - Minimum 1 peer approval required
   - 2 approvals required for: smart contract changes, security-sensitive code, database migrations
   - Product owner approval required for: user-facing changes, API contract changes

### Quality Gates

CI/CD pipeline enforces these gates (ALL must pass):

**Pre-Merge Gates:**
- ✅ Lint checks (ESLint, Prettier)
- ✅ Type checks (TypeScript strict mode)
- ✅ Unit tests (>80% coverage for critical modules)
- ✅ Integration tests
- ✅ Security scan (dependency vulnerabilities, code security patterns)
- ✅ Build succeeds (all environments: dev, staging, production)

**Pre-Deployment Gates (Staging/Production):**
- ✅ All pre-merge gates pass
- ✅ End-to-end tests pass
- ✅ Performance benchmarks within acceptable thresholds
- ✅ Database migration dry-run succeeds
- ✅ Smart contract audit complete (for blockchain changes)
- ✅ Rollback plan documented

### Testing Strategy

Test pyramid MUST be followed (more unit tests, fewer integration, minimal E2E):

**Unit Tests (Most Common):**
- Test individual functions, components, services in isolation
- Mock external dependencies
- Fast execution (<1 second per test)
- High coverage (>80% for critical modules)

**Integration Tests:**
- Test interaction between modules/services
- Use test databases, mock external APIs
- Verify data flows correctly through system layers
- Cover critical user journeys

**Contract Tests:**
- Test API contracts match OpenAPI specification
- Verify request/response schemas
- Ensure backward compatibility

**End-to-End Tests (Selective):**
- Test critical user journeys from UI to database
- Include: registration → authentication → game session → prize distribution
- Run against staging environment
- Slower, more brittle - use sparingly

**Smart Contract Tests:**
- Test all smart contract functions with unit tests (Anchor framework)
- Test failure scenarios and edge cases
- Verify token math precision
- Test access control and authorization

## Performance Monitoring

### Required Metrics

System MUST collect and monitor these metrics continuously:

**Application Performance:**
- API endpoint response times (p50, p95, p99)
- Database query performance
- Cache hit rates (Redis)
- Error rates by endpoint
- WebRTC latency measurements

**Infrastructure:**
- CPU, memory, disk usage per service
- Network throughput and latency
- Container health and restart counts
- Database connection pool utilization

**Business Metrics:**
- Active users (concurrent, daily, monthly)
- Game sessions created and completed
- Financial transactions volume and value
- NFT minting and trading volume
- Betting market participation

**Alerting Thresholds:**
- API p95 >200ms for >5 minutes
- Error rate >1% for >2 minutes
- Database CPU >80% for >5 minutes
- Cache hit rate <70% for >10 minutes
- Smart contract transaction failures >0.1%

### Observability Requirements

ALL services MUST implement structured logging:

**Log Levels:**
- ERROR: System errors requiring immediate attention
- WARN: Unexpected conditions not causing failure
- INFO: Important business events (user registration, game start, transactions)
- DEBUG: Detailed diagnostic information (development only)

**Required Log Fields:**
- Timestamp (ISO 8601)
- Service name and version
- Request ID (for tracing across services)
- User ID (when applicable)
- Action/event type
- Relevant context data

**Distributed Tracing:**
- ALL cross-service requests MUST include trace ID
- Use OpenTelemetry standard
- Track request flow through microservices

## Security Incident Response

### Incident Classification

**Critical (Response <1 hour):**
- Smart contract vulnerability discovered
- User financial data breach
- Authentication bypass
- Active DoS attack

**High (Response <4 hours):**
- Data leak (non-financial user data)
- Unauthorized access to admin functions
- Significant performance degradation

**Medium (Response <24 hours):**
- Vulnerability report (not actively exploited)
- Failed automated security scans
- Rate limiting bypass

### Response Procedure

1. **Detection:** Automated alerts, user reports, security scans
2. **Assessment:** Classify severity, identify impact scope
3. **Containment:** Isolate affected systems, deploy emergency patches
4. **Eradication:** Fix root cause, verify fix effectiveness
5. **Recovery:** Restore services, verify system integrity
6. **Post-Incident:** Document incident, update security measures, notify affected users

## Governance

### Amendment Process

Constitution amendments require:

1. **Proposal:** Document proposed change with rationale in ADR format
2. **Review:** Technical leadership review (minimum 3 reviewers)
3. **Approval:** Unanimous approval from technical leadership required
4. **Migration Plan:** Document impact on existing code, provide migration timeline
5. **Communication:** Announce changes to all development teams 2 weeks before enforcement
6. **Update:** Increment version number, update last amended date, document in SYNC IMPACT REPORT

### Version Semantics

Constitution follows semantic versioning:

- **MAJOR (X.0.0):** Backward-incompatible changes (principle removal, fundamental redefinition)
- **MINOR (x.Y.0):** New principles added, materially expanded requirements
- **PATCH (x.y.Z):** Clarifications, wording improvements, typo fixes

### Compliance Review

Constitution compliance MUST be verified:

- **Every Pull Request:** Reviewers check constitution alignment
- **Monthly Audits:** Technical leadership reviews recent changes for compliance
- **Quarterly Reviews:** Full constitution review, identify needed amendments
- **Annual Refresh:** Constitution principles updated based on lessons learned

### Enforcement

Constitution violations are handled as follows:

- **Pre-Merge Violations:** Block merge, require changes before approval
- **Post-Merge Violations:** Create remediation task, prioritize based on severity
- **Repeated Violations:** Team training, process improvements, automated enforcement
- **Intentional Violations:** Require technical leadership approval with documented justification

### Complexity Justification

When violating simplicity principles (adding complexity), document:

- **Why Needed:** Specific problem being solved
- **Alternatives Rejected:** Simpler approaches considered and why insufficient
- **Mitigation:** How complexity is managed (abstraction, documentation, testing)
- **Review Trigger:** Conditions that would warrant revisiting this decision

**Version**: 1.0.0 | **Ratified**: 2025-10-21 | **Last Amended**: 2025-10-21
