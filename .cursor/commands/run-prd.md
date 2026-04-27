# /run-prd

Execute a PRD through the Signal Lab orchestrator pipeline.

## Usage
```
/run-prd <prd-path>
/run-prd prds/002_prd-observability-demo.md
/run-prd prds/002_prd-observability-demo.md --resume   # continue from last checkpoint
```

## What This Command Does

Activates `@signal-lab-orchestrator` with the given PRD path.

The orchestrator:
1. Creates `.execution/<timestamp>/context.json`
2. Runs 7 phases sequentially: analysis → codebase-scan → planning → decomposition → implementation → review → report
3. Delegates 80%+ of implementation tasks to fast model subagents
4. Saves progress after each task (resume-safe)
5. Outputs final report with completed/failed tasks

## Resume
If interrupted, run with `--resume` flag. Orchestrator finds the latest `.execution/*/context.json` and continues from `currentPhase`.

## Expected duration
- Simple PRD (1–3 features): ~10–15 min
- Full PRD (9 features like PRD 002): ~25–35 min

## After completion
1. Review the final report
2. Run `docker compose up -d` if infra changed
3. Run verification walkthrough from README.md
4. Use `/check-obs` to verify observability is complete
