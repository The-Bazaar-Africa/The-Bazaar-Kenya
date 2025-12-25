# The Bazaar Kenya - GitHub Organization Setup

**Organization:** The-Bazaar-Africa  
**Repository:** The-Bazaar-Kenya  
**Account Type:** Enterprise (GitHub Team)

## Organization Settings

### Access Control
- **Default Role:** Maintain (read + push)
- **Member Permissions:** Allow public repo creation, Allow private repo creation
- **Base Role:** Read
- **2FA Requirement:** Mandatory for all members
- **SAML SSO:** Configure for enterprise user management

### Teams Structure
```
The-Bazaar-Africa (Organization)
├── @engineering (All developers)
│   ├── @backend (Fastify, Database)
│   ├── @frontend (Next.js, React)
│   └── @devops (Infrastructure, CI/CD)
├── @product (Product & Stakeholders)
├── @security (Security & Compliance)
└── @admin (Organization admins)
```

### Repository Settings
- **Default Branch:** `main` (production-ready)
- **Auto-delete Head Branches:** Enabled
- **Require Branches:** Protected
- **Require Status Checks:** Enabled
- **Require PR Reviews:** 1 minimum
- **Dismiss Stale Reviews:** Yes
- **Require Code Owner Review:** Yes
- **Restrict Pushes:** Only admins to main

### Billing & Limits
- **Seats:** Allocated for 15 team members (scalable)
- **Storage:** 2GB minimum (LFS enabled for media)
- **Actions:** Unlimited CI/CD minutes
- **Packages:** Private npm registry support

---

## Repository Configuration

### Branch Protection Rules

#### `main` (Production)
- Require pull request reviews: **1 approval**
- Require code owner reviews: **Yes**
- Require status checks: **All passing**
  - `lint`, `test`, `build`, `security-scan`
- Require branches up-to-date: **Yes**
- Require conversation resolution: **Yes**
- Allow force pushes: **No**
- Allow deletions: **No**

#### `develop` (Staging)
- Require pull request reviews: **1 approval**
- Require status checks: **lint, test, build**
- Require branches up-to-date: **Yes**
- Allow force pushes: **No (admins only)**

#### `feature/*` (Development)
- No protections (developer flexibility)
- Automated cleanup after 7 days (if merged)

---

## Code Owners & Reviewers

File: `.github/CODEOWNERS`

```
# Backend API
apps/backend-api/**  @engineering/backend
libs/database/**     @engineering/backend
libs/api-client/**   @engineering/backend

# Frontend Apps
apps/main-app/**     @engineering/frontend
apps/admin-portal/** @engineering/frontend
apps/vendor-portal/** @engineering/frontend
libs/ui/**           @engineering/frontend
libs/hooks/**        @engineering/frontend

# Infrastructure & DevOps
.github/**           @engineering/devops
docker/**            @engineering/devops
migrations/**        @engineering/devops
.env*                @engineering/security

# Configuration & Security
tsconfig.json        @engineering/backend @engineering/frontend
package.json         @engineering/backend @engineering/frontend
nx.json              @engineering/devops
SECURITY.md          @security
```

---

## CI/CD Automation

### GitHub Actions Workflows

#### 1. **PR Checks** (`.github/workflows/pr.yml`)
- ESLint & TypeScript type checks
- Jest unit tests (all packages)
- Build verification
- Security scanning (Snyk)
- Code coverage reports

#### 2. **Deploy** (`.github/workflows/deploy.yml`)
- **main** → Production (Vercel frontend + Railway backend)
- **develop** → Staging
- Automated changelog generation
- Release notes creation

#### 3. **Security** (`.github/workflows/security.yml`)
- Dependency scanning (Dependabot)
- SAST (CodeQL)
- Container scanning (if applicable)
- Secrets scanning

#### 4. **Scheduled Tasks**
- Weekly dependency updates
- Monthly security audit
- Nightly stress tests

---

## Team Expansion Plan

### Phase 1: Core Team (Current)
- 1 CTO/Tech Lead
- 2 Backend Engineers
- 2 Frontend Engineers
- 1 DevOps Engineer
**Total: 6**

### Phase 2: Growth (6 months)
- 2 Additional Backend Engineers
- 2 Additional Frontend Engineers
- 1 QA Engineer
- 1 Product Manager
**Total: 12**

### Phase 3: Enterprise (12 months)
- Senior Backend Architect
- Senior Frontend Architect
- DevOps Lead
- Security Engineer
- 2 Junior Developers
- Solutions Architect
**Total: 20**

### Team Onboarding Process
1. **GitHub:** Create user account, add to team
2. **Access:** Configure SSH keys, 2FA, SAML SSO
3. **Local Setup:** Clone, `pnpm install`, configure IDE
4. **Documentation:** Read CONTRIBUTING.md, DEVELOPMENT.md
5. **First PR:** Small bug fix or documentation update
6. **Approval:** Tech lead review & merge

---

## Security & Compliance

### GitHub Security Settings
- ✅ Require 2FA for all members
- ✅ Enable branch protection on main/develop
- ✅ Enable branch restrictions (push only to develop)
- ✅ Enable commit signing (enforced for main)
- ✅ Enable audit logging
- ✅ Regular security reviews (quarterly)

### Sensitive Data Protection
- Use GitHub Secrets for environment variables
- Use GitHub Environments (Production, Staging, Dev)
- Rotate PATs every 90 days
- Use organization-owned deploy keys (not personal)
- No credentials in .env files (use .env.example)

### Deployment Keys
```
Frontend (Vercel):
- Repo: The-Bazaar-Kenya
- Scope: deploy-main (read-only)
- Expiry: 1 year (renew annually)

Backend (Railway):
- Repo: The-Bazaar-Kenya
- Scope: deploy-main (read-only)
- Expiry: 1 year (renew annually)

Database (Supabase):
- Repo: The-Bazaar-Kenya
- Scope: migrations (read-only)
- Expiry: 1 year (renew annually)
```

---

## Operational Runbooks

### New Developer Onboarding
1. Request GitHub account from @admin
2. Get added to @engineering team
3. Configure local environment:
   ```bash
   git clone https://github.com/The-Bazaar-Africa/The-Bazaar-Kenya.git
   cd The-Bazaar-Kenya
   pnpm install
   pnpm nx run-many --target dev
   ```
4. Create feature branch: `git checkout -b feature/TICKET-123`
5. Create PR with template
6. Get reviewed by code owner
7. Merge via GitHub UI

### Release Process
1. Create release branch: `git checkout -b release/v1.2.0`
2. Update version in `package.json`
3. Run full test suite
4. Create GitHub Release with changelog
5. Tag: `git tag v1.2.0`
6. Merge back to main & develop
7. CI/CD auto-deploys to production

### Hotfix Process
1. Create hotfix branch: `git checkout -b hotfix/CRITICAL-BUG`
2. Fix issue & test thoroughly
3. Create PR to main with `[HOTFIX]` prefix
4. Require 2 approvals (security)
5. Deploy immediately to production
6. Backmerge to develop

---

## Monitoring & Analytics

### GitHub Insights
- PR merge time target: **< 24 hours**
- Code review target: **< 4 hours**
- Test coverage minimum: **80%**
- Build success rate: **> 95%**

### Reporting
- Weekly team standup (sync PR metrics)
- Monthly retrospective (process improvements)
- Quarterly security audit (penetration testing)
- Annual infrastructure review (scaling needs)

---

## Documentation Links
- [Contributing Guide](.github/CONTRIBUTING.md)
- [Development Setup](.github/DEVELOPMENT.md)
- [Security Policy](./SECURITY.md)
- [Code of Conduct](.github/CODE_OF_CONDUCT.md)
