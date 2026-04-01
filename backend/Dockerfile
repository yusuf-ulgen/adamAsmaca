# Java 17 ve Maven iceren bir base image ile derleme (build) asamasi
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Testleri atlayarak uygulamayi build ediyoruz
RUN mvn clean package -DskipTests

# Build edilen JAR'i calistirmak icin daha hafif bir image (JDK 17)
FROM openjdk:17.0.1-jdk-slim
WORKDIR /app
# Build asamasindan cikan jar dosyasini guncel image'a kopyala
COPY --from=build /app/target/demo-0.0.1-SNAPSHOT.jar app.jar
# Docker container'i icinde calisacak port
EXPOSE 8080
# Uygulamayi baslat
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
