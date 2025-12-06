- [x] Service separation by business domain (auth, hotels) ✅
- [x] Independent deployment of services (each can run on different ports) ✅
- [x] Shared code management (utilities, models, different package.json, dependencies) ✅

➡️ Microservices: Each service owns its data

- [ ] auth-service → Firebase Auth + Firestore (users collection)
- [ ] hotel-service → Separate Firestore DB or PostgreSQL (hotels, rooms)
- [ ] booking-service → MongoDB (bookings, transactions)

➡️ Microservices communication between services: Services communicate via

- [ ] Synchronous: RESTful APIs (internal network) or gRPC (for performance)
- [ ] Asynchronous: Message queues (e.g., RabbitMQ, Kafka) for events like booking confirmations

➡️ Microservices service discovery and load balancing: Dynamic service registry

- [ ] Consul, Eureka, or Kubernetes DNS

➡️ Microservices API Gateway: Single entry point for clients

- [ ] Kong, NGINX, or Express Gateway
- [ ] Routes: /api/auth → auth-service:4001
      /api/hotels → hotel-service:4002

➡️ Microservices independent deployment and scaling: Each service can be deployed and scaled independently

- [ ] Docker containers for each service
- [ ] CI/CD pipelines for automated deployments
- [ ] Kubernetes for orchestration
