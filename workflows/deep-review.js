export const meta = {
  name: 'deep-review',
  description: 'Multi-dimensional code review with adversarial verification',
  whenToUse: 'Use when thorough review is needed before merging — covers correctness, security, performance, and test coverage in parallel',
  phases: [
    { title: 'Review', detail: 'Parallel review across 4 dimensions' },
    { title: 'Verify', detail: 'Adversarial verification of each finding' }
  ]
}

const FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    dimension: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          file: { type: 'string' },
          line: { type: 'number' },
          severity: { type: 'string', enum: ['critical', 'important', 'minor'] },
          description: { type: 'string' }
        },
        required: ['title', 'file', 'severity', 'description']
      }
    }
  },
  required: ['dimension', 'findings']
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    isReal: { type: 'boolean' },
    reasoning: { type: 'string' },
    title: { type: 'string' },
    file: { type: 'string' },
    severity: { type: 'string' }
  },
  required: ['isReal', 'reasoning']
}

const DIMENSIONS = [
  {
    key: 'correctness',
    prompt: 'Review the current git diff (staged + unstaged) for correctness issues: logic errors, off-by-one, null/undefined access, wrong types, missing error handling at boundaries. Report findings with file, line, severity, and description.'
  },
  {
    key: 'security',
    prompt: 'Review the current git diff for security issues: injection (SQL, command, XSS), path traversal, hardcoded secrets, unsafe deserialization, missing auth checks. Report findings with file, line, severity, and description.'
  },
  {
    key: 'performance',
    prompt: 'Review the current git diff for performance issues: N+1 queries, unnecessary allocations in loops, missing indexes, blocking I/O on hot paths, unbounded collections. Report findings with file, line, severity, and description.'
  },
  {
    key: 'test-coverage',
    prompt: 'Review the current git diff for test coverage gaps: new code paths without tests, edge cases not covered, tests that only test happy path, tests that mock too much. Report findings with file, line, severity, and description.'
  }
]

phase('Review')
const results = await pipeline(
  DIMENSIONS,
  (d) => agent(d.prompt, {
    label: 'review:' + d.key,
    phase: 'Review',
    schema: FINDINGS_SCHEMA
  }),
  (review) => {
    if (!review || !review.findings || review.findings.length === 0) return []
    return parallel(review.findings.map((f) => () =>
      agent(
        'Adversarially verify this finding. Try to REFUTE it. Default to refuted=true if uncertain.\n\nFinding: ' + f.title + '\nFile: ' + f.file + '\nSeverity: ' + f.severity + '\nDescription: ' + f.description,
        { label: 'verify:' + (f.file || 'unknown'), phase: 'Verify', schema: VERDICT_SCHEMA }
      ).then((v) => v && v.isReal ? f : null)
    ))
  }
)

const confirmed = results.flat().filter(Boolean)
log('Deep review complete: ' + confirmed.length + ' confirmed findings')
return { confirmed }
