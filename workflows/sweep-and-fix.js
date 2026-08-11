export const meta = {
  name: 'sweep-and-fix',
  description: 'Find and fix issues across multiple files in parallel',
  whenToUse: 'Use when a pattern needs to be applied across many files — migrations, renames, style fixes',
  phases: [
    { title: 'Discover', detail: 'Find all files matching the pattern' },
    { title: 'Fix', detail: 'Apply fix to each file in isolated worktree' }
  ]
}

const FIX_SCHEMA = {
  type: 'object',
  properties: {
    file: { type: 'string' },
    changes: { type: 'number' },
    summary: { type: 'string' }
  },
  required: ['file', 'changes', 'summary']
}

const pattern = args && args.pattern ? args.pattern : '**/*'
const instruction = args && args.instruction ? args.instruction : 'Fix issues in this file'

phase('Discover')
const discovery = await agent(
  'Find all files matching "' + pattern + '" that need changes for: ' + instruction + '. Return a JSON array of file paths.',
  { label: 'discover', schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string' } } }, required: ['files'] } }
)

if (!discovery || !discovery.files || discovery.files.length === 0) {
  log('No files found matching pattern')
  return { fixed: [] }
}

log('Found ' + discovery.files.length + ' files to process')

phase('Fix')
const fixed = await pipeline(
  discovery.files,
  (file) => agent(
    'Apply this change to ' + file + ': ' + instruction + '\n\nEdit only this file. Report what you changed.',
    { label: 'fix:' + file, phase: 'Fix', isolation: 'worktree', schema: FIX_SCHEMA }
  )
)

const results = fixed.filter(Boolean)
log('Fixed ' + results.length + '/' + discovery.files.length + ' files')
return { fixed: results }
