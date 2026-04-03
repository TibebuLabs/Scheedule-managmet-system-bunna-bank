# Staff Assignment Email Notification Bugfix Design

## Overview

When a schedule is created and staff are assigned, `sendScheduleNotifications()` in
`schedule.service.js` simulates email delivery instead of calling the real `EmailService`.
It logs to the console, sets `notificationSent = true`, and marks `emailStatus = 'sent'`
without ever invoking `emailService.sendEmail()`. A fully configured `EmailService`
(nodemailer/Gmail) already exists in `email.service.js` and is never used.

The fix is minimal: import `emailService` into `schedule.service.js` and replace the
simulated block inside `sendScheduleNotifications()` with a real call to
`emailService.sendEmail()`, using `emailService.generateTaskAssignmentTemplate()` for
the HTML body. All other logic (per-assignment success/failure tracking, partial-send
status, skip-when-disabled path) remains unchanged.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug — `sendEmail !== false` AND
  at least one assignment exists AND `emailService.sendEmail()` is never called
- **Property (P)**: The desired behavior — `emailService.sendEmail()` is called for each
  assignment and the result drives `notificationSent` / `emailStatus` accurately
- **Preservation**: All behaviors unrelated to the simulated block must remain identical
  after the fix (skip-when-disabled path, database save, partial-send logic, per-assignment
  failure handling)
- **sendScheduleNotifications(schedule)**: The method in
  `full-stackauthentication/services/schedule.service.js` responsible for iterating
  assignments and dispatching email notifications
- **emailService**: The singleton instance of `EmailService` exported from
  `full-stackauthentication/services/email.service.js`
- **generateTaskAssignmentTemplate(schedule, assignment)**: Method on `EmailService` that
  returns a fully rendered HTML string for a task assignment notification email
- **emailStatus**: Per-assignment field (`'pending'` | `'sent'` | `'failed'`) and
  schedule-level field (`'pending'` | `'all_sent'` | `'partial_sent'` | `'failed'`)

## Bug Details

### Bug Condition

The bug manifests whenever `sendScheduleNotifications()` is called with `schedule.sendEmail`
not equal to `false` and at least one assignment is present. The method never calls
`emailService.sendEmail()` — it only simulates the call with a `console.log` and a
`setTimeout`, then unconditionally marks every assignment as successfully notified.

**Formal Specification:**
```
FUNCTION isBugCondition(schedule)
  INPUT: schedule — a saved Schedule document
  OUTPUT: boolean

  RETURN schedule.sendEmail !== false
         AND schedule.assignments.length > 0
         AND emailService.sendEmail WAS NOT CALLED during sendScheduleNotifications(schedule)
END FUNCTION
```

### Examples

- Schedule created with 2 staff members, `sendEmail: true` → console shows
  "Sending email to: alice@example.com" but Alice receives nothing; her
  `notificationSent` is set to `true` (false positive)
- Schedule created with `sendEmail: false` → no email attempted, no bug (preserved path)
- Schedule created with 1 staff member whose email is invalid → simulated path still
  marks `emailStatus: 'sent'`; real path would catch the SMTP error and mark `'failed'`

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- When `sendEmail` is explicitly `false`, the method SHALL continue to skip all email
  sending and log that notifications are disabled (Requirement 3.1)
- The schedule SHALL continue to be saved to the database before any email attempt,
  regardless of email outcome (Requirement 3.2)
- When some assignments succeed and others fail, `emailStatus` on the schedule SHALL
  continue to be set to `'partial_sent'` and per-assignment results SHALL continue to
  reflect individual outcomes (Requirement 3.3)
- When a staff member has no valid email, the error SHALL continue to be caught per
  assignment without aborting remaining notifications (Requirement 3.4)

**Scope:**
All code paths that do NOT enter the simulated block — including the `sendEmail: false`
early-exit, the database save, the schedule-level status aggregation, and the
`createSchedule` caller — must be completely unaffected by this fix.

## Hypothesized Root Cause

1. **Missing Import**: `emailService` is never imported in `schedule.service.js`. The
   file imports `Schedule`, `Task`, `Staff`, and `date-fns` but has no reference to
   `email.service.js`.

2. **Placeholder Never Replaced**: The simulated block (`console.log` + `setTimeout`)
   was written as a temporary stub during development and was never replaced with the
   real call.

3. **No Error Path Exercised**: Because the stub never throws, the `catch` block inside
   the loop is never reached, masking the fact that real SMTP errors are unhandled.

4. **False Success Metrics**: The unconditional `assignment.notificationSent = true`
   means the database always shows full delivery, so the bug is invisible from the
   admin UI.

## Correctness Properties

Property 1: Bug Condition - Real Email Delivery on Assignment

_For any_ schedule where `isBugCondition` returns true (sendEmail is not false and at
least one assignment exists), the fixed `sendScheduleNotifications` SHALL call
`emailService.sendEmail(assignment.email, subject, html)` for each assignment, and SHALL
set `assignment.notificationSent`, `assignment.notificationSentAt`, and
`assignment.emailStatus` based on the actual result returned by `emailService.sendEmail()`.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Non-Buggy Path Behavior Unchanged

_For any_ input where the bug condition does NOT hold (i.e., `sendEmail === false`, or
any code path outside `sendScheduleNotifications`), the fixed code SHALL produce exactly
the same behavior as the original code, preserving the skip-notification path, database
persistence, partial-send aggregation, and per-assignment error isolation.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Fix Implementation

### Changes Required

**File**: `full-stackauthentication/services/schedule.service.js`

**Change 1 — Add import at top of file:**
```js
const emailService = require('../services/email.service');
```

**Function**: `sendScheduleNotifications(schedule)`

**Change 2 — Replace simulated block with real email call:**

Remove:
```js
// Simulate email sending (replace with actual email service)
console.log(`📧 Sending email to: ${assignment.email}`);

// Update assignment status
assignment.notificationSent = true;
assignment.notificationSentAt = new Date();
assignment.emailStatus = 'sent';

successfulCount++;

notificationResults.push({
  success: true,
  staffName: assignment.staffName,
  email: assignment.email,
  sentAt: new Date()
});

// Simulate slight delay
await new Promise(resolve => setTimeout(resolve, 100));
```

Replace with:
```js
const subject = `Task Assignment: ${schedule.taskTitle} — ${schedule.scheduleId}`;
const html = emailService.generateTaskAssignmentTemplate(schedule, assignment);

const result = await emailService.sendEmail(assignment.email, subject, html);

if (result.success) {
  assignment.notificationSent = true;
  assignment.notificationSentAt = new Date();
  assignment.emailStatus = 'sent';
  successfulCount++;
  notificationResults.push({
    success: true,
    staffName: assignment.staffName,
    email: assignment.email,
    sentAt: new Date()
  });
} else {
  throw new Error(result.error || 'Email delivery failed');
}
```

No other files need to change.

## Testing Strategy

### Validation Approach

Two-phase approach: first run exploratory tests against the unfixed code to surface
counterexamples and confirm the root cause, then verify the fix satisfies Property 1
and Property 2.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix.
Confirm that `emailService.sendEmail()` is never called on the unfixed code.

**Test Plan**: Mock `emailService.sendEmail` with a spy, call
`sendScheduleNotifications()` with a schedule that has assignments, and assert the spy
was called. On unfixed code this assertion will fail, confirming the root cause.

**Test Cases**:
1. **Single Assignment Test**: Create a schedule with one assignment, call
   `sendScheduleNotifications()`, assert `emailService.sendEmail` spy was called once
   (will fail on unfixed code)
2. **Multiple Assignments Test**: Create a schedule with three assignments, assert spy
   called three times (will fail on unfixed code)
3. **False Success Record Test**: After calling `sendScheduleNotifications()` on unfixed
   code, assert `assignment.emailStatus === 'sent'` even though spy was never called —
   this confirms the false-positive record (will pass on unfixed code, demonstrating the
   misleading state)
4. **SMTP Failure Propagation Test**: Configure spy to return `{ success: false, error:
   'SMTP timeout' }`, assert assignment is marked `'failed'` (will fail on unfixed code
   because the stub never reaches the catch path)

**Expected Counterexamples**:
- `emailService.sendEmail` spy call count is 0 when it should be ≥ 1
- Possible causes: missing import, stub never replaced, no wiring between the two services

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function
calls `emailService.sendEmail()` and sets assignment status from the real result.

**Pseudocode:**
```
FOR ALL schedule WHERE isBugCondition(schedule) DO
  result := sendScheduleNotifications_fixed(schedule)
  ASSERT emailService.sendEmail WAS CALLED for each assignment
  ASSERT assignment.notificationSent REFLECTS emailService result
  ASSERT assignment.emailStatus REFLECTS emailService result
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed
function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL schedule WHERE NOT isBugCondition(schedule) DO
  ASSERT sendScheduleNotifications_original(schedule)
       = sendScheduleNotifications_fixed(schedule)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking
because it generates many schedule/assignment combinations automatically and catches
edge cases (zero assignments, all-fail, mixed success/fail) that manual tests miss.

**Test Cases**:
1. **Skip-When-Disabled Preservation**: Verify that when `sendEmail === false`,
   `createSchedule` still skips `sendScheduleNotifications` and returns success — observe
   on unfixed code, then assert identical behavior after fix
2. **Partial Send Preservation**: Verify that when some assignments fail, `emailStatus`
   is set to `'partial_sent'` on the schedule document — observe on unfixed code (with
   spy throwing for some), then assert same aggregation logic after fix
3. **Database Save Preservation**: Verify schedule is saved to DB before any email
   attempt — assert `schedule.save()` is called regardless of email outcome
4. **Per-Assignment Error Isolation**: Verify that one assignment's SMTP failure does not
   abort remaining assignments — assert all assignments are attempted even when one throws

### Unit Tests

- Test that `emailService.sendEmail` is called with correct `(email, subject, html)` args
- Test that a successful `sendEmail` result sets `notificationSent: true` and
  `emailStatus: 'sent'`
- Test that a failed `sendEmail` result sets `notificationSent: false` and
  `emailStatus: 'failed'`
- Test that `generateTaskAssignmentTemplate` is called with the schedule and assignment

### Property-Based Tests

- Generate random arrays of assignments (0–10 items) and verify that the number of
  `sendEmail` calls equals the number of assignments with `sendEmail !== false`
- Generate random mixes of success/failure results from `sendEmail` and verify that
  `emailStatus` on the schedule is `'all_sent'`, `'partial_sent'`, or `'failed'`
  according to the counts
- Generate schedules with `sendEmail: false` and verify `sendEmail` is never called
  across all generated inputs

### Integration Tests

- Create a real schedule via `createSchedule()` with a mocked `emailService`, assert
  the mock was called and the returned `notifications` array reflects real results
- Create a schedule where one assignment's email fails, assert `emailStatus:
  'partial_sent'` on the saved document and correct per-assignment flags
- Create a schedule with `sendEmail: false`, assert no email mock calls and schedule
  saved successfully
