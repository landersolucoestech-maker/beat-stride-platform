# Worker

This application will execute asynchronous application use cases using the same domain and application modules as the API.

It has no public HTTP surface. Critical asynchronous workflows will use the Transactional Outbox pattern and idempotent handlers.
