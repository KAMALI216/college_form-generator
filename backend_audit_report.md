# Project Audit Report: College Form Generator Backend

This audit provides an overview of the existing backend resources, configurations, and dependencies before we introduce new features.

---

## 1. Inventory of Spring Boot Components

Below is the list of Controller, Service, Repository, and Entity classes in `src/main/java/com/collegeformgenerator/backend`:

### Controllers
* **[AuthController.java](file:///K:/Studies/Project/college_form_generator/backend/src/main/java/com/collegeformgenerator/backend/controller/AuthController.java)**
  * **Package:** `com.collegeformgenerator.backend.controller`
  * **Summary:** Exposes REST endpoints for user authentication, specifically `/api/auth/signup` (user registration), `/api/auth/register-admin` (admin registration with secret key check), and `/api/auth/login` (login validation).

### Services
* **[UserService.java](file:///K:/Studies/Project/college_form_generator/backend/src/main/java/com/collegeformgenerator/backend/service/UserService.java)**
  * **Package:** `com.collegeformgenerator.backend.service`
  * **Summary:** Handles business logic for registration (encoding password, duplicate email checks) and credentials/role-based user authentication.

### Repositories
* **[UserRepository.java](file:///K:/Studies/Project/college_form_generator/backend/src/main/java/com/collegeformgenerator/backend/repository/UserRepository.java)**
  * **Package:** `com.collegeformgenerator.backend.repository`
  * **Summary:** Spring Data JPA repository for the `User` entity to query users by email (case-insensitive) and check email existence.

### Entities & Enums
* **[User.java](file:///K:/Studies/Project/college_form_generator/backend/src/main/java/com/collegeformgenerator/backend/entity/User.java)**
  * **Package:** `com.collegeformgenerator.backend.entity`
  * **Summary:** JPA entity mapping to the `users` table representing users (both ADMIN and USER roles) and their profile details.
* **[UserRole.java](file:///K:/Studies/Project/college_form_generator/backend/src/main/java/com/collegeformgenerator/backend/entity/UserRole.java)**
  * **Package:** `com.collegeformgenerator.backend.entity`
  * **Summary:** Enumeration defining the system roles: `ADMIN` and `USER`.

### Helper DTOs, Configs, & Others
* **[AdminSignupRequest.java](file:///K:/Studies/Project/college_form_generator/backend/src/main/java/com/collegeformgenerator/backend/dto/AdminSignupRequest.java)**: DTO for admin registration requests.
* **[AuthResponse.java](file:///K:/Studies/Project/college_form_generator/backend/src/main/java/com/collegeformgenerator/backend/dto/AuthResponse.java)**: Response structure returned upon successful login or registration.
* **[LoginRequest.java](file:///K:/Studies/Project/college_form_generator/backend/src/main/java/com/collegeformgenerator/backend/dto/LoginRequest.java)**: DTO containing login credentials and target role.
* **[SignupRequest.java](file:///K:/Studies/Project/college_form_generator/backend/src/main/java/com/collegeformgenerator/backend/dto/SignupRequest.java)**: DTO for standard user registration requests.
* **[AppConfig.java](file:///K:/Studies/Project/college_form_generator/backend/src/main/java/com/collegeformgenerator/backend/config/AppConfig.java)**: Configures a `PasswordEncoder` bean (`BCryptPasswordEncoder`) and cross-origin (CORS) mappings.
* **[ApiException.java](file:///K:/Studies/Project/college_form_generator/backend/src/main/java/com/collegeformgenerator/backend/exception/ApiException.java)**: Custom API exception class extending `ResponseStatusException`.

---

## 2. Configuration Properties

### [application.properties](file:///K:/Studies/Project/college_form_generator/backend/src/main/resources/application.properties)
This is the default configuration file containing local MySQL configurations:
```properties
spring.application.name=backend
server.port=8080

spring.datasource.url=jdbc:mysql://localhost:3306/form_generator?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:Kamali@216}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.open-in-view=false

app.admin.secret-key=${ADMIN_SECRET_KEY:8807634655}
```
* **Server Port:** `8080`
* **MySQL Configuration:**
  * **URL:** `jdbc:mysql://localhost:3306/form_generator` (plus params)
  * **Driver:** `com.mysql.cj.jdbc.Driver`
  * **Username:** Defaults to `root`
  * **Password:** Defaults to `Kamali@216`
* **JWT/Security Properties:** None configured yet. (Only a custom admin registration secret key is present: `app.admin.secret-key`).

### [application-dev.properties](file:///K:/Studies/Project/college_form_generator/backend/src/main/resources/application-dev.properties)
Used for in-memory H2 testing/development:
```properties
spring.datasource.url=jdbc:h2:mem:devdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.username=sa
spring.datasource.password=
spring.datasource.driver-class-name=org.h2.Driver

spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# H2 console (use for development)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

---

## 3. Spring Security Configuration

* **SecurityConfig Class:** **Does not exist.**
* **Secured / Permitted Endpoints:** 
  Since the standard `spring-boot-starter-security` starter dependency is missing, there is no Spring Security architecture active. Therefore, **all endpoints are fully public (permitted)**.
  *(Note: A BCrypt-based `PasswordEncoder` bean is created manually inside [AppConfig.java](file:///K:/Studies/Project/college_form_generator/backend/src/main/java/com/collegeformgenerator/backend/config/AppConfig.java) using the `spring-security-crypto` library).*

---

## 4. Entity-to-Table Mapping Status

| Target MySQL Table & Fields | Mapping Entity File | Status | Notes |
| :--- | :--- | :--- | :--- |
| **users** <br> `(id, full_name, email, password, role ENUM('ADMIN','USER'), created_at)` | [User.java](file:///K:/Studies/Project/college_form_generator/backend/src/main/java/com/collegeformgenerator/backend/entity/User.java) | **Exists** | Matches all columns. `role` maps to `UserRole` enum. |
| **admins** <br> `(id, username, password_hash)` | *None* | **Missing** | Admin users are currently expected to register and login through the general `users` table with the role set to `ADMIN` (using a secret key validation during signup). |
| **form_templates** <br> `(id, form_name, description, form_schema JSON, created_at)` | *None* | **Missing** | Need to create template entity and map JSON fields. |
| **form_submissions** <br> `(id, form_id, user_id, submission JSON, submitted_at)` | *None* | **Missing** | Need to create submission entity and set up JPA associations to template/user and map JSON. |

---

## 5. Maven Dependencies in [pom.xml](file:///K:/Studies/Project/college_form_generator/backend/pom.xml)

* **`spring-boot-starter-web`**: **Present**
* **`spring-boot-starter-data-jpa`**: **Present**
* **`mysql-connector-j`**: **Present**
* **`spring-boot-starter-security`**: **Missing** *(Only `spring-security-crypto` is present)*
* **`jjwt` (or other JWT library)**: **Missing**
* *Other dependencies present:* `spring-boot-starter-validation`, `h2` (dev runtime), `spring-boot-starter-test` (test scope).

---

## 6. Global Exception Handler

* **Location:** [GlobalExceptionHandler.java](file:///K:/Studies/Project/college_form_generator/backend/src/main/java/com/collegeformgenerator/backend/exception/GlobalExceptionHandler.java)
* **Content:**
```java
package com.collegeformgenerator.backend.exception;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, String>> handleApiException(ApiException exception) {
        Map<String, String> body = new HashMap<>();
        body.put("message", exception.getReason());
        return ResponseEntity.status(exception.getStatusCode()).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(MethodArgumentNotValidException exception) {
        Map<String, String> body = new HashMap<>();
        String message = exception.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(fieldError -> fieldError.getDefaultMessage())
                .orElse("Validation failed");
        body.put("message", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception exception) {
        Map<String, String> body = new HashMap<>();
        body.put("message", "Unexpected server error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
```
