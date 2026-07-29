# Commit Rules & Git Workflow

## Commit Message Format

All commit messages must follow this structure:

`
type(scope): description
`

### Types
- eat - New feature
- ix - Bug fix
- docs - Documentation changes
- style - Formatting, missing semicolons, etc. (no code change)
- efactor - Code change that neither fixes a bug nor adds a feature
- perf - Performance improvement
- 	est - Adding or updating tests
- chore - Maintenance tasks, dependency updates

### Scopes
- hero - Hero section changes
- 
avigation - Header, menu, language selector
- properties - Property listings, filters, search
- property-detail - Single property page
- dmin - Admin dashboard changes
- i18n - Internationalization/translations
- design - Design system, colors, typography
- nimation - Framer Motion, transitions
- supabase - Database, API, backend
- deps - Dependency updates

### Examples
`
feat(hero): add unified search panel with location selector
fix(navigation): resolve mobile menu z-index issue
docs(project): update PROJECT_DOCUMENTATION.md
style(design): adjust gold accent color for better contrast
refactor(supabase): extract property queries to separate module
`

## Rules

1. **Every edit must be committed** - No uncommitted changes left in working directory
2. **Atomic commits** - One logical change per commit
3. **Descriptive messages** - Clear description of what and why
4. **Update documentation** - If behavior changes, update relevant docs
5. **Never commit secrets** - API keys, tokens, passwords must be in .env.local only
6. **Test before commit** - Run 
pm run build to verify no breakage
7. **Pull before push** - Always git pull before pushing to remote

## Workflow

1. Make code changes
2. Run 
pm run build to verify
3. Stage files: git add <files>
4. Commit: git commit -m "type(scope): description"
5. Push: git push origin master
6. Update CHANGELOG.md if user-facing change

## Sensitive Files (NEVER commit)
- .env.local
- Any file containing API keys, tokens, passwords
- scripts/run-migration*.mjs
- scripts/seed*.mjs
- scripts/check-*.mjs
- scripts/diagnose-*.mjs

## Branch Strategy
- master - Production-ready code
- Feature branches for major features (if needed)

## Documentation Requirements
Every commit that changes behavior must update:
- PROJECT_DOCUMENTATION.md for architectural changes
- CHANGELOG.md for user-facing features
- Code comments for complex logic
