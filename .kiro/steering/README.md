# Steering Rules

This directory contains steering files that provide context and instructions to Kiro AI.

## What are Steering Files?

Steering files allow you to include additional context and instructions in your interactions with Kiro. They can contain:
- Team standards and coding conventions
- Project-specific information
- Build and test instructions
- Architecture guidelines

## Types of Steering Files

### Always Included (Default)
Files without frontmatter or with `inclusion: always` are included in every interaction.

### Conditional Inclusion
Add frontmatter to include files only when specific files are read:

```markdown
---
inclusion: fileMatch
fileMatchPattern: "*.tsx"
---

Your steering content here...
```

### Manual Inclusion
Add frontmatter to include files only when manually referenced with `#`:

```markdown
---
inclusion: manual
---

Your steering content here...
```

## File References

You can reference other files in your steering rules using:
```
#[[file:path/to/file.ext]]
```

This is useful for including API specs, schemas, or other documentation.
