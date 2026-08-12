## ADDED Requirements

### Requirement: Single-owner authentication

The app SHALL authenticate the user through Supabase Auth and SHALL grant access to note data only to the single configured owner account.

#### Scenario: Unauthenticated visitor

- **WHEN** an unauthenticated visitor opens any route other than the sign-in route
- **THEN** the app redirects them to the sign-in route and shows no note data

#### Scenario: Owner signs in

- **WHEN** the owner completes the Supabase Auth sign-in flow
- **THEN** the app establishes a session and renders the notes workspace

#### Scenario: Non-owner authenticated user

- **WHEN** any authenticated account other than the configured owner attempts to read or write note data
- **THEN** Row Level Security denies the operation and no note data is returned

### Requirement: Session persistence and sign-out

The app SHALL persist the owner's session across page reloads and SHALL provide a way to sign out.

#### Scenario: Reload with active session

- **WHEN** the owner reloads the app with a valid session
- **THEN** the app restores the session without requiring re-authentication

#### Scenario: Sign out

- **WHEN** the owner signs out
- **THEN** the session is cleared and the app redirects to the sign-in route

### Requirement: Data isolation via Row Level Security

Every note and folder row SHALL be protected by Row Level Security policies that restrict all reads and writes to the owning user.

#### Scenario: Query scoped to owner

- **WHEN** the owner queries folders or notes
- **THEN** only rows belonging to the owner are returned, enforced at the database level
