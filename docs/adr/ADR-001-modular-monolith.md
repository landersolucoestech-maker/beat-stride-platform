# ADR-001: Modular Monolith

Status: Accepted

## Decision
Use a modular monolith for the initial platform. Business modules own their domain, application use cases, persistence adapters, and interface adapters. Module boundaries are enforced in code and tests.

## Consequences
The platform avoids premature distributed-system complexity while retaining explicit ownership boundaries that can support later extraction when demonstrated operational needs justify it.
