# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

**Do NOT report security vulnerabilities through public GitHub issues.**

### How to Report

1. **Email:** security@thebazaar.africa
2. **Subject:** [SECURITY] Brief description
3. **Include:**
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Acknowledgment:** Within 24 hours
- **Initial Assessment:** Within 72 hours
- **Resolution Target:** Within 14 days (critical), 30 days (high), 90 days (medium/low)

### Safe Harbor

We will not pursue legal action against researchers who:
- Act in good faith
- Avoid privacy violations and data destruction
- Do not exploit vulnerabilities beyond proof-of-concept
- Report findings promptly

## Security Practices

### For Contributors

1. Never commit secrets, API keys, or credentials
2. Use environment variables for sensitive data
3. Follow the principle of least privilege
4. Keep dependencies updated
5. Use parameterized queries for database operations

### For Maintainers

1. Enable branch protection on `main`
2. Require signed commits for releases
3. Review Dependabot alerts weekly
4. Conduct security reviews for auth/payment changes
5. Use secret scanning and push protection
