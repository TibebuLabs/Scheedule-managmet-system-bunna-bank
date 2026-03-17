# Bugfix Requirements Document

## Introduction

When a schedule is created and staff members are assigned to it, the system is supposed to send email notifications to each assigned staff member. However, no emails are ever delivered. The `sendScheduleNotifications()` method in `schedule.service.js` only simulates sending — it logs to the console and marks `notificationSent = true` without ever invoking the real `EmailService`. A fully functional `EmailService` (nodemailer/Gmail) already exists and is configured with valid credentials, but it is never called. This bug means assigned staff are unaware of their assignments until they manually check the system.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a schedule is created with one or more assigned staff members and `sendEmail` is not false THEN the system logs "Sending email to: [email]" to the console but does NOT call `emailService.sendEmail()`, resulting in no email being delivered to any staff member.

1.2 WHEN `sendScheduleNotifications()` completes THEN the system sets `assignment.notificationSent = true` and `assignment.emailStatus = 'sent'` even though no real email was sent, producing a false success record in the database.

1.3 WHEN the schedule's email status is checked after creation THEN the system reports `emailSent: true` and `emailStatus: 'all_sent'` despite no emails having been transmitted.

### Expected Behavior (Correct)

2.1 WHEN a schedule is created with one or more assigned staff members and `sendEmail` is not false THEN the system SHALL call `emailService.sendEmail()` for each assignment, delivering a real email to the staff member's address with the task title, schedule date, schedule type, priority, estimated hours, and schedule ID.

2.2 WHEN `emailService.sendEmail()` returns a successful result for an assignment THEN the system SHALL set `assignment.notificationSent = true`, `assignment.notificationSentAt` to the current timestamp, and `assignment.emailStatus = 'sent'` to accurately reflect delivery.

2.3 WHEN `emailService.sendEmail()` fails for an assignment THEN the system SHALL set `assignment.notificationSent = false` and `assignment.emailStatus = 'failed'`, and SHALL include the error detail in the notification result without crashing the overall schedule creation flow.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN `sendEmail` is explicitly set to `false` on the schedule creation request THEN the system SHALL CONTINUE TO skip all email sending and log that notifications are disabled.

3.2 WHEN a schedule is created THEN the system SHALL CONTINUE TO save the schedule to the database regardless of whether email sending succeeds or fails.

3.3 WHEN some assignments succeed and others fail during bulk notification THEN the system SHALL CONTINUE TO set `emailStatus` to `'partial_sent'` on the schedule document and return per-assignment results indicating which succeeded and which failed.

3.4 WHEN a staff member does not have a valid email address stored THEN the system SHALL CONTINUE TO handle the error gracefully per assignment without aborting the remaining notifications.
