# Taste Profile

## Communication
- Prefers to communicate in Indonesian (Bahasa Indonesia). Confidence: 0.9

## Workflow
- Wants the assistant to thoroughly explore and understand the existing codebase/module (structure, patterns, conventions, dead code) before making any modifications. Confidence: 0.8
- Test cleanup (e.g., afterAll) must delete all data created during the test — including auto-generated related records, not just the primary one (e.g., creating a location auto-creates an office, so both the office id and location id must be tracked and both deleted) to avoid leaving orphan data. Confidence: 0.8
