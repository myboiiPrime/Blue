# Build stage
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
# Download dependencies and build a cache layer
RUN mvn dependency:go-offline
# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM openjdk:17-jdk-alpine
WORKDIR /app

# Add a non-root user to run the application
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy the jar from the build stage
COPY --from=build /build/target/*.jar app.jar

# Configure JVM for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

EXPOSE 8080

CMD ["java", "$JAVA_OPTS", "-jar", "app.jar"]