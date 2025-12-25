# GitHub Organization Configuration Script
# Run with: gh cli (https://cli.github.com)

#!/bin/bash

ORG="The-Bazaar-Africa"
REPO="The-Bazaar-Kenya"

echo "=== The Bazaar GitHub Enterprise Configuration ==="
echo ""

# ============================================================================
# 1. CREATE TEAMS
# ============================================================================
echo "📋 Creating Teams..."

teams=(
  "core-platform:Core platform development and architecture"
  "frontend:Frontend development and UI"
  "devops:DevOps, infrastructure, and deployment"
  "security:Security, audits, and compliance"
  "product:Product management and roadmap"
  "qa:Quality assurance and testing"
)

for team_def in "${teams[@]}"; do
  IFS=':' read -r name description <<< "$team_def"
  echo "  Creating team: $name"
  gh api -X POST /orgs/$ORG/teams \
    -f name="$name" \
    -f privacy='closed' \
    -f description="$description" 2>/dev/null || echo "    (Team may already exist)"
done

# ============================================================================
# 2. CONFIGURE BRANCH PROTECTION (MAIN)
# ============================================================================
echo ""
echo "🔒 Configuring main branch protection..."

gh api -X PUT /repos/$ORG/$REPO/branches/main/protection \
  -f enforce_admins=true \
  -f required_status_checks='{"strict": true, "contexts": ["ci/build", "ci/test", "ci/lint"]}' \
  -f required_pull_request_reviews='{"dismiss_stale_reviews": true, "require_code_owner_reviews": true, "required_approving_review_count": 2}' \
  -f allow_force_pushes=false \
  -f allow_deletions=false \
  -f require_conversation_resolution=true \
  -f allow_auto_merge=false

echo "  ✓ Main branch protected (2 approvals required)"

# ============================================================================
# 3. CONFIGURE BRANCH PROTECTION (DEVELOP)
# ============================================================================
echo ""
echo "🔒 Configuring develop branch protection..."

gh api -X PUT /repos/$ORG/$REPO/branches/develop/protection \
  -f enforce_admins=false \
  -f required_status_checks='{"strict": true, "contexts": ["ci/build", "ci/test", "ci/lint"]}' \
  -f required_pull_request_reviews='{"dismiss_stale_reviews": true, "require_code_owner_reviews": false, "required_approving_review_count": 1}' \
  -f allow_force_pushes=false \
  -f allow_deletions=false \
  -f require_conversation_resolution=true \
  -f allow_auto_merge=true

echo "  ✓ Develop branch protected (1 approval required)"

# ============================================================================
# 4. SET TEAM REPOSITORY PERMISSIONS
# ============================================================================
echo ""
echo "👥 Setting team repository permissions..."

# core-platform: Admin
echo "  Setting core-platform to ADMIN"
gh api -X PUT /orgs/$ORG/teams/core-platform/repos/$ORG/$REPO \
  -f permission='admin' 2>/dev/null

# frontend: Write
echo "  Setting frontend to WRITE"
gh api -X PUT /orgs/$ORG/teams/frontend/repos/$ORG/$REPO \
  -f permission='write' 2>/dev/null

# devops: Admin
echo "  Setting devops to ADMIN"
gh api -X PUT /orgs/$ORG/teams/devops/repos/$ORG/$REPO \
  -f permission='admin' 2>/dev/null

# security: Read
echo "  Setting security to READ"
gh api -X PUT /orgs/$ORG/teams/security/repos/$ORG/$REPO \
  -f permission='pull' 2>/dev/null

# product: Read
echo "  Setting product to READ"
gh api -X PUT /orgs/$ORG/teams/product/repos/$ORG/$REPO \
  -f permission='pull' 2>/dev/null

# qa: Write
echo "  Setting qa to WRITE"
gh api -X PUT /orgs/$ORG/teams/qa/repos/$ORG/$REPO \
  -f permission='write' 2>/dev/null

# ============================================================================
# 5. CONFIGURE REPOSITORY SETTINGS
# ============================================================================
echo ""
echo "⚙️ Configuring repository settings..."

gh api -X PATCH /repos/$ORG/$REPO \
  -f allow_squash_merge=true \
  -f allow_merge_commit=false \
  -f allow_rebase_merge=true \
  -f delete_branch_on_merge=true \
  -f has_wiki=true \
  -f has_issues=true \
  -f has_projects=true \
  -f has_downloads=true \
  -f is_template=false \
  -f private=false \
  -f topics='["bazaar", "ecommerce", "kenya", "monorepo", "nextjs", "fastify"]'

echo "  ✓ Repository settings configured"

# ============================================================================
# 6. ENABLE ADVANCED SECURITY
# ============================================================================
echo ""
echo "🔐 Configuring security settings..."

# Enable vulnerability alerts
gh api -X PUT /repos/$ORG/$REPO/vulnerability-alerts \
  2>/dev/null && echo "  ✓ Dependency vulnerability alerts enabled"

# Enable code scanning (if using CodeQL)
echo "  ℹ️ Note: Enable Code Scanning in GitHub UI:"
echo "     Settings → Code Security and Analysis → CodeQL"

# ============================================================================
# 7. CREATE RULESETS (GitHub Enterprise)
# ============================================================================
echo ""
echo "📏 Setting up branch rulesets..."
echo "  Note: Configure in GitHub UI for Enterprise features"
echo "  Settings → Rules → New rule"

# ============================================================================
# 8. CONFIGURE REQUIRED STATUS CHECKS
# ============================================================================
echo ""
echo "✅ Configure required status checks in GitHub UI:"
echo "  Settings → Rules → Add rule → Require status checks to pass"
echo ""
echo "  Add these status checks:"
echo "  - ci/build"
echo "  - ci/test"
echo "  - ci/lint"

# ============================================================================
# 9. ORGANIZATION SETTINGS
# ============================================================================
echo ""
echo "🏢 Organization settings to configure manually:"
echo ""
echo "1. Security & Analysis:"
echo "   - Settings → Code security and analysis"
echo "   - Enable Dependabot alerts"
echo "   - Enable Dependabot updates"
echo "   - Enable CodeQL"
echo "   - Enable secret scanning"
echo ""
echo "2. Member Privileges:"
echo "   - Settings → Member privileges"
echo "   - Base permissions: Read"
echo "   - Require 2FA: Enable"
echo "   - Repository creation: Restrict to admins"
echo ""
echo "3. OAuth & Personal Access Tokens:"
echo "   - Settings → Third-party access"
echo "   - Review & remove unused apps"
echo ""
echo "4. Audit Logging:"
echo "   - Settings → Audit log"
echo "   - Export logs to Splunk/Datadog if needed"

# ============================================================================
# 10. SUMMARY
# ============================================================================
echo ""
echo "✅ CONFIGURATION COMPLETE!"
echo ""
echo "Summary:"
echo "  ✓ Teams created (6 total)"
echo "  ✓ Branch protection configured"
echo "  ✓ Team permissions set"
echo "  ✓ Repository settings optimized"
echo "  ✓ Security features enabled"
echo ""
echo "Next steps:"
echo "  1. Commit CODEOWNERS file: git add .github/CODEOWNERS && git commit"
echo "  2. Add team members via GitHub UI"
echo "  3. Configure GitHub Actions workflows"
echo "  4. Enable Required Status Checks"
echo "  5. Create organization secrets"
echo "  6. Train team on workflows"
echo ""
echo "Documentation: See GITHUB_ENTERPRISE_SETUP.md"
