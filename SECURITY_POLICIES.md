# The Bazaar - Enterprise Security & Policies

## Table of Contents
1. [Security Overview](#security-overview)
2. [Access Control](#access-control)
3. [Secrets Management](#secrets-management)
4. [Code Security](#code-security)
5. [Incident Response](#incident-response)
6. [Compliance](#compliance)
7. [Audit & Monitoring](#audit--monitoring)

---

## SECURITY OVERVIEW

### Security Principles
1. **Least Privilege:** Users have minimum permissions needed
2. **Defense in Depth:** Multiple layers of security controls
3. **Zero Trust:** Verify every access request
4. **Transparency:** Security decisions documented
5. **Continuous Improvement:** Regular audits and updates

### Security Champions
- **Organization:** Security team lead
- **Backend:** Core-platform lead
- **Frontend:** Frontend lead
- **DevOps:** DevOps lead

---

## ACCESS CONTROL

### GitHub Organization

#### 2FA Requirement: MANDATORY
All organization members must enable:
- Two-factor authentication (2FA)
- TOTP (Time-based One-Time Password) recommended
- SMS as backup only

**Enforcement:** Automatic after 30 days

#### Role-Based Access Control (RBAC)
```
Owner
├── Full access to all organization settings
├── Manage members and teams
├── Can not be limited
└── Limited to 2-3 critical people

Admin
├── Full repository access
├── Can manage teams
├── Can manage workflows
├── Can manage secrets
└── Typically: leads + DevOps

Maintain
├── Write access to repos
├── Can merge PRs
├── Can manage some settings
└── Typically: senior engineers

Write
├── Can push to repo
├── Can create PRs
├── Can review PRs
└── Typically: developers

Triage
├── Can read and clone
├── Can assign issues/PRs
├── Can create discussions
└── Reserved for future use

Read
├── Can read and clone only
├── Can comment on issues
└── Typically: product, security (read-only)
```

#### Repository Access Rules
```
main branch:
  - Write: No direct commits (PR only)
  - Admin approval: 2+ required
  - Code owners: Required review
  - Status checks: All must pass
  - Deploy: DevOps only

develop branch:
  - Write: Via PR only
  - Admin approval: 1+ required
  - Code owners: Auto-request only
  - Status checks: All must pass
  - Deploy: Team leads + DevOps

feature/* branches:
  - Write: Author + assigned reviewers
  - Push: Branch creator + team members
  - Delete: Owner or admin
```

---

## SECRETS MANAGEMENT

### Secret Categories

#### 1. Production Secrets (Critical)
**Rotation:** Quarterly + on incidents  
**Storage:** GitHub Organization Secrets (encrypted)  
**Access:** DevOps team + engineering lead  
**Audit:** Full audit trail maintained

```
SUPABASE_SERVICE_ROLE_KEY_PROD
DATABASE_URL_PROD
API_KEY_PAYSTACK_LIVE
SENDGRID_API_KEY_PROD
CLOUDFLARE_API_TOKEN
VERCEL_PRODUCTION_TOKEN
RAILWAY_API_TOKEN
SENTRY_DSN_PROD
JWT_SECRET_PROD
```

#### 2. Development Secrets (Internal)
**Rotation:** Semi-annually  
**Storage:** GitHub Secrets  
**Access:** All developers  
**Audit:** Weekly review

```
SUPABASE_ANON_KEY_DEV
SUPABASE_URL_DEV
DATABASE_URL_DEV
API_KEY_PAYSTACK_TEST
NEXTAUTH_SECRET_DEV
JWT_SECRET_DEV
SENTRY_DSN_DEV
```

#### 3. CI/CD Secrets
**Rotation:** With provider updates  
**Storage:** GitHub Repository Secrets  
**Access:** DevOps + Core-platform leads  
**Audit:** Monthly review

```
GITHUB_TOKEN (scoped)
VERCEL_TOKEN_STAGING
VERCEL_TOKEN_PRODUCTION
RAILWAY_API_TOKEN
GCP_SERVICE_ACCOUNT (if used)
```

#### 4. Third-Party Integration Keys
**Rotation:** As per provider policy  
**Storage:** Environment-specific  
**Access:** Service owners  
**Audit:** Quarterly

```
STRIPE_API_KEY (future)
TWILIO_AUTH_TOKEN (if used)
SLACK_BOT_TOKEN
DATADOG_API_KEY
```

### Secret Rotation Schedule

```
Date        | Secret Category      | Owner          | Status
------------|----------------------|----------------|----------
Jan 1       | Production secrets   | DevOps         | Rotate
Apr 1       | Production secrets   | DevOps         | Rotate
Jul 1       | Production secrets   | DevOps         | Rotate
Oct 1       | Production secrets   | DevOps         | Rotate
Jun 1       | Dev secrets          | Core-platform  | Rotate
Dec 1       | Dev secrets          | Core-platform  | Rotate
Monthly     | CI/CD tokens         | DevOps         | Audit
Quarterly   | Third-party keys     | Service owners | Audit
On-demand   | After security event | All            | Immediate
```

### Secret Handling Best Practices

✅ DO:
- Store in GitHub Secrets (encrypted at rest)
- Rotate on schedule
- Audit access logs
- Limit to necessary permissions
- Use service accounts when possible
- Document secret owners
- Monitor for accidental exposure
- Use environment-specific secrets

❌ DON'T:
- Commit secrets to repository
- Share secrets in Slack/Email
- Use personal API keys in production
- Reuse secrets across environments
- Give admin-level access to bots
- Hardcode secrets in code
- Leave secrets in PR/logs
- Ignore rotation schedules

---

## CODE SECURITY

### Dependency Management

#### Automated Dependency Scanning
**Tool:** Dependabot (GitHub native)  
**Frequency:** Daily  
**Auto-merge:** Patch versions only

```
Rules:
├── Critical security: Auto-merge
├── High severity: Require 1 approval
├── Medium severity: Require review
├── Low severity: Grouped weekly

Target:
├── Production deps: Always monitor
├── Dev deps: Monthly updates
└── Direct deps: Priority > transitive
```

#### Vulnerability Response
```
Severity  | Response Time | Action
----------|---------------|----------------------------------
Critical  | 4 hours       | Deploy patch immediately
High      | 24 hours      | Schedule for next release
Medium    | 1 week        | Include in next sprint
Low       | 1 month       | Batch with other updates
```

### Code Scanning

#### Static Application Security Testing (SAST)
**Tools:**
- CodeQL (GitHub native)
- ESLint with security plugins
- TypeScript strict mode
- SonarQube (future)

**Frequency:** On every PR + nightly

**Rules:**
```
Security Issue Levels:
├── Critical: Block merge
├── High: Require security review + approval
├── Medium: Require discussion in PR
├── Low: Log and monitor
```

#### Secrets Scanning
**Tool:** GitHub native + third-party (Gitguardian optional)  
**Frequency:** Real-time on push  
**Action:** Block push + alert security team

**Patterns Detected:**
- AWS credentials
- GitHub tokens
- Private keys
- Database connection strings
- API keys
- Custom patterns (Paystack, SendGrid, etc.)

### Secure Coding Standards

#### Authentication & Authorization
```
❌ UNSAFE:
- Storing passwords in plain text
- Sessions without expiration
- Hardcoding secret keys
- Weak password policies
- JWT without signature verification

✅ SAFE:
- bcrypt/Argon2 password hashing
- 24-hour max session duration
- Environment variables for secrets
- Strong password requirements (12+ chars)
- JWT with RS256 signing
- Rate limiting on auth endpoints
- 2FA for admin accounts
```

#### API Security
```
❌ UNSAFE:
- Exposing sensitive data in URLs
- Missing input validation
- SQL injection vulnerabilities
- CORS misconfiguration
- Missing CSRF protection
- Verbose error messages

✅ SAFE:
- All sensitive data in POST body
- Input validation & sanitization
- Parameterized queries (Prisma)
- Restrictive CORS policy
- CSRF token validation
- Generic error messages
- Rate limiting & throttling
- API versioning strategy
```

#### Frontend Security
```
❌ UNSAFE:
- Storing secrets in localStorage
- Trusting client-side validation only
- XSS vulnerabilities
- Missing Content Security Policy
- Unencrypted API calls

✅ SAFE:
- Secrets in httpOnly cookies
- Server-side validation always
- Sanitized output rendering
- CSP headers configured
- HTTPS/TLS enforced
- Subresource Integrity (SRI) for CDN
```

### Dependency Audit Process
1. **PR Submitted:** Dependabot creates PR
2. **Automated Checks:** Run tests + security scans
3. **Review:** Team lead approves
4. **Merge:** Auto-merge or manual
5. **Deploy:** Staging → production
6. **Monitor:** Watch for issues

---

## INCIDENT RESPONSE

### Security Incident Severity Levels

```
CRITICAL (P0)
├── Production data breach
├── Active exploitation in production
├── Unauthorized access to sensitive systems
├── Malware detected
└── Customer data exposure

Response Time: 15 minutes
Escalation: Page on-call + security lead
Actions: Isolate, notify, investigate
```

```
HIGH (P1)
├── Vulnerability in production code
├── Exposed secret found in repository
├── Failed authentication mechanism
├── Suspicious activity detected
└── Security control failure

Response Time: 1 hour
Escalation: Security team + DevOps
Actions: Assess, mitigate, patch
```

```
MEDIUM (P2)
├── Low-risk vulnerability found
├── Security tooling issues
├── Dependency updates needed
├── Policy violation detected
└── Access control misconfiguration

Response Time: 24 hours
Escalation: Team lead
Actions: Document, plan fix, implement
```

```
LOW (P3)
├── Information gathering
├── Typosquatting on dependencies
├── Deprecated library usage
└── Best practice deviation

Response Time: 1 week
Escalation: None
Actions: Track, plan, implement with other work
```

### Incident Response Checklist

```
IMMEDIATE (First 30 minutes)
☐ Confirm incident
☐ Page on-call + security lead
☐ Create incident channel (Slack)
☐ Isolate affected system if critical
☐ Collect initial evidence
☐ Notify affected stakeholders (if needed)

SHORT-TERM (First 4 hours)
☐ Complete incident investigation
☐ Document findings
☐ Implement temporary mitigation
☐ Plan permanent fix
☐ Notify relevant teams

MEDIUM-TERM (Next 24 hours)
☐ Deploy permanent fix
☐ Verify fix effectiveness
☐ Update security controls if needed
☐ Communicate all-clear message

FOLLOW-UP (Within 1 week)
☐ Conduct postmortem
☐ Document lessons learned
☐ Implement preventive measures
☐ Update policies/procedures if needed
☐ Share findings with team
```

### Incident Communication Template

**Subject:** [SECURITY INCIDENT] [Severity] - [Brief Description]

```
INCIDENT SUMMARY
ID: [Generated]
Severity: [CRITICAL/HIGH/MEDIUM/LOW]
Detection Time: [UTC timestamp]
Impact: [Systems/Data affected]
Status: [Investigating/Mitigating/Resolved]

TIMELINE
[Time] - Incident detected
[Time] - Investigation started
[Time] - Root cause identified
[Time] - Mitigation deployed
[Time] - All-clear confirmed

IMPACT ASSESSMENT
Affected Systems: [List]
Affected Users: [Estimated count]
Data Compromised: [Yes/No/Unknown]
Business Impact: [Description]

REMEDIATION ACTIONS
[Action 1]
[Action 2]
[Action 3]

NEXT STEPS
[Follow-up action 1]
[Follow-up action 2]
```

---

## COMPLIANCE

### Data Protection (GDPR/Local)
```
✅ Implementation:
├── Data classification (PII/Sensitive/Public)
├── Privacy policy documentation
├── Data retention policies
├── Right to deletion support
├── Consent management
├── Data processing agreements
└── Privacy impact assessments

Responsibility:
├── Product: Consent collection
├── Backend: Data handling
├── DevOps: Data retention
└── Security: Auditing
```

### Payment Processing (PCI-DSS)
```
✅ Implementation:
├── No PCI data in logs
├── Encrypted card transmission
├── Paystack integration (outsourced)
├── API token rotation
├── Network segmentation
├── Access logging
└── Regular security testing

Responsibility:
├── Backend: API integration
├── DevOps: Network security
└── Security: Compliance verification
```

### Authentication Standards
```
✅ Implementation:
├── OWASP top 10 defense
├── Password best practices
├── Session management
├── MFA for sensitive operations
├── Token-based auth (JWT)
└── Rate limiting on auth endpoints
```

---

## AUDIT & MONITORING

### Audit Logging
```
Logged Events:
├── Team member additions/removals
├── Repository access changes
├── Secret access/rotation
├── Deployment activity
├── Security events
├── Policy changes
└── Privileged operations

Retention: 90 days minimum (configurable)
Access: Security team + auditors
Review: Monthly

Location: GitHub Audit Log
├── https://github.com/organizations/The-Bazaar-Africa/settings/audit-log
└── Export for compliance if needed
```

### Security Scanning Dashboard
```
Tools:
├── Dependabot (Dependencies)
├── CodeQL (Code scanning)
├── Secret scanner (Exposed secrets)
├── Workflow audits (CI/CD)
└── Access reviews (IAM)

Weekly Review:
├── Identified vulnerabilities
├── Failed checks count
├── Remediation progress
└── New security issues
```

### Monthly Security Review Checklist
```
Week 1:
☐ Review audit logs
☐ Check failed security scans
☐ Validate secret rotation status
☐ Review access changes

Week 2:
☐ Dependency vulnerability assessment
☐ Code scanning findings review
☐ Team access matrix validation
☐ Password policy compliance

Week 3:
☐ Incident review (if any)
☐ Policy updates needed?
☐ Training requirements
☐ Tool updates

Week 4:
☐ Generate compliance report
☐ Executive summary
☐ Remediation plan
☐ Schedule improvements
```

### Security Metrics
```
KPI: Vulnerability Mean Time to Remediation (MTTR)
Target: Critical <4 hours, High <24 hours, Medium <1 week
Tracked: Weekly

KPI: Code Coverage
Target: 80%+
Tracked: Per PR

KPI: Failed Security Checks
Target: <5 non-critical issues per release
Tracked: Per release

KPI: Incident Response Time
Target: Critical <15 min, High <1 hour
Tracked: Monthly postmortems

KPI: Access Review Completion
Target: 100% within 1 week
Tracked: Monthly
```

---

## SECURITY CONTACTS

### Primary Security Lead
- **Name:** [To be assigned]
- **Email:** security@thebazaar.ke
- **Phone:** [Emergency contact]
- **Escalation:** Engineering Lead

### DevOps Lead (Infrastructure Security)
- **Name:** [To be assigned]
- **Email:** [DevOps email]
- **Slack:** @devops-lead

### Engineering Lead (Code Security)
- **Name:** [To be assigned]
- **Email:** [Engineering email]
- **Slack:** @engineering-lead

### External Security Consultant
- **Vendor:** [Future - to be engaged]
- **Contact:** [To be added]
- **Services:** Quarterly audits, incident response support

---

## REFERENCES

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [PCI DSS Compliance](https://www.pcisecuritystandards.org/)
- [GDPR Data Protection](https://gdpr-info.eu/)

