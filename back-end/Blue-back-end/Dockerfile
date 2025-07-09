# Runtime stage
FROM openjdk:17-jdk-alpine
WORKDIR /app

# Add a non-root user to run the application
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy the jar from local target directory
COPY target/blue-0.0.1-SNAPSHOT.jar app.jar

# Configure JVM for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

EXPOSE 8080

CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]