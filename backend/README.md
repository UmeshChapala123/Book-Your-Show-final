# Book Your Show - Backend API

A Spring Boot REST API backend for the Book Your Show application. This backend provides endpoints for managing users, theatres, shows, and bookings.

## Technology Stack

- **Java**: 17
- **Spring Boot**: 3.3.4
- **Build Tool**: Maven
- **Database**: H2 (in-memory, default) / MySQL (configurable)
- **JPA**: Jakarta Persistence API
- **Validation**: Jakarta Validation (JSR-380)

## Project Structure

```
backend/
├── pom.xml
└── src/
    └── main/
        ├── java/com/example/bookyourshow/
        │   ├── BookYourShowApplication.java
        │   ├── config/
        │   │   ├── CorsConfig.java
        │   │   └── DataLoader.java
        │   ├── controller/
        │   │   ├── BookingController.java
        │   │   ├── ShowController.java
        │   │   ├── TheatreController.java
        │   │   └── UserController.java
        │   ├── dto/
        │   │   ├── BookingRequest.java
        │   │   ├── BookingResponse.java
        │   │   ├── ShowRequest.java
        │   │   ├── ShowResponse.java
        │   │   ├── TheatreRequest.java
        │   │   ├── TheatreResponse.java
        │   │   ├── UserRequest.java
        │   │   └── UserResponse.java
        │   ├── entity/
        │   │   ├── Booking.java
        │   │   ├── Show.java
        │   │   ├── Theatre.java
        │   │   └── User.java
        │   ├── exception/
        │   │   ├── BadRequestException.java
        │   │   ├── ConflictException.java
        │   │   ├── GlobalExceptionHandler.java
        │   │   └── ResourceNotFoundException.java
        │   ├── repository/
        │   │   ├── BookingRepository.java
        │   │   ├── ShowRepository.java
        │   │   ├── TheatreRepository.java
        │   │   └── UserRepository.java
        │   └── service/
        │       ├── BookingService.java
        │       ├── BookingServiceImpl.java
        │       ├── ShowService.java
        │       ├── ShowServiceImpl.java
        │       ├── TheatreService.java
        │       ├── TheatreServiceImpl.java
        │       ├── UserService.java
        │       └── UserServiceImpl.java
        └── resources/
            ├── application.yml
            └── db.json
```

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6+ (or use Maven Wrapper)

### Running the Application

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

   Or if using Maven Wrapper:
   ```bash
   ./mvnw spring-boot:run
   ```

3. **The application will start on:** `http://localhost:8080`

4. **H2 Console:** `http://localhost:8080/h2-console`
   - JDBC URL: `jdbc:h2:mem:bookyourshow`
   - Username: `sa`
   - Password: (empty)

### Data Seeding

The application automatically loads data from `src/main/resources/db.json` on startup. The `DataLoader` component:
- Reads the `db.json` file
- Preserves exact IDs from the JSON file
- Handles duplicate IDs (keeps the last occurrence)
- Ensures show `seatsAvailable` matches the authoritative value from `db.json`
- Logs warnings for any inconsistencies

**Note:** Data is only loaded if the database is empty. If you want to reload data, clear the database first.

## API Endpoints

### Base URL
All endpoints are prefixed with `/api`

### User Endpoints

- **POST** `/api/users` - Create a new user
- **GET** `/api/users` - Get all users
- **GET** `/api/users/{id}` - Get user by ID
- **PUT** `/api/users/{id}` - Update user
- **DELETE** `/api/users/{id}` - Delete user

### Theatre Endpoints

- **GET** `/api/theatres` - Get all theatres (supports `?city=` filter)
- **POST** `/api/theatres` - Create a new theatre
- **GET** `/api/theatres/{id}` - Get theatre by ID

### Show Endpoints

- **GET** `/api/shows` - Get all shows (supports `?theatreId=` and `?movieTitle=` filters)
- **POST** `/api/shows` - Create a new show
- **GET** `/api/shows/{id}` - Get show by ID
- **PUT** `/api/shows/{id}` - Update show
- **DELETE** `/api/shows/{id}` - Delete show

### Booking Endpoints

- **POST** `/api/bookings` - Create a new booking
- **GET** `/api/bookings` - Get all bookings (supports `?userId=` filter)
- **GET** `/api/bookings/{id}` - Get booking by ID
- **DELETE** `/api/bookings/{id}` - Cancel booking

## Example Requests

### List Shows
```bash
curl http://localhost:8080/api/shows
```

### Create Booking
```bash
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "showId": 4,
    "seats": 2
  }'
```

### Cancel Booking
```bash
curl -X DELETE http://localhost:8080/api/bookings/9
```

### Get Shows by Theatre
```bash
curl http://localhost:8080/api/shows?theatreId=2
```

### Get Theatres by City
```bash
curl http://localhost:8080/api/theatres?city=Hyderabad
```

## Request/Response Examples

### Create Booking Request
```json
{
  "userId": 1,
  "showId": 4,
  "seats": 2
}
```

### Create Booking Response
```json
{
  "id": 29,
  "userId": 1,
  "showId": 4,
  "seats": 2,
  "totalPrice": 500.00,
  "status": "CONFIRMED",
  "bookingTime": "2025-01-20T10:30:00"
}
```

### Show Response (matches frontend format)
```json
{
  "id": 4,
  "movieTitle": "Animal",
  "theatreId": 2,
  "date": "2025-11-19",
  "time": "19:00",
  "price": 250.00,
  "seatsAvailable": 222
}
```

## CORS Configuration

CORS is enabled for the following origins:
- `http://localhost:3000` (React default)
- `http://localhost:4200` (Angular default)

To modify CORS settings, update `CorsConfig.java` or `application.yml`.

## Database Configuration

### H2 (Default - In-Memory)
The application uses H2 in-memory database by default. Data is lost when the application stops.

### MySQL (Optional)
To switch to MySQL, uncomment and configure the MySQL section in `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/bookyourshow
    username: root
    password: password
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
```

**Note:** You'll need to add MySQL driver dependency to `pom.xml`:
```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

## Error Handling

The API returns standardized error responses:

```json
{
  "timestamp": "2025-01-20T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "User not found with id: 999",
  "path": "/api/users/999"
}
```

### HTTP Status Codes

- `200 OK` - Successful GET, PUT, DELETE
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE (no response body)
- `400 Bad Request` - Validation errors or invalid input
- `404 Not Found` - Resource not found
- `409 Conflict` - Conflict (e.g., not enough seats available)
- `500 Internal Server Error` - Server error

## Validation

The API uses Jakarta Validation (JSR-380) for input validation:

- **User**: name, email (required, valid email format)
- **Theatre**: name, city (required)
- **Show**: movieTitle, theatreId, date, time, price, seatsAvailable (required, positive values)
- **Booking**: userId, showId, seats (required, positive values)

Validation errors return a `400 Bad Request` with field-level error details:

```json
{
  "timestamp": "2025-01-20T10:30:00",
  "status": 400,
  "error": "Validation Failed",
  "message": "Invalid input data",
  "errors": {
    "email": "Email should be valid",
    "seats": "Seats must be positive"
  }
}
```

## Booking Logic

### Creating a Booking

1. Validates user and show exist
2. Validates seats requested > 0 and <= available seats
3. **Atomically decrements** `show.seatsAvailable` (transactional)
4. Calculates `totalPrice = show.price * seats`
5. Creates booking with status `CONFIRMED`

### Cancelling a Booking

1. Validates booking exists and is not already cancelled
2. Restores seats back to the show
3. Updates booking status to `CANCELLED`

**Note:** Booking creation is transactional to prevent race conditions.

## Testing

Run tests with:
```bash
mvn test
```

## Building

Build the project:
```bash
mvn clean package
```

This creates a JAR file in `target/bookyourshow-backend-0.0.1-SNAPSHOT.jar`

Run the JAR:
```bash
java -jar target/bookyourshow-backend-0.0.1-SNAPSHOT.jar
```

## Frontend Integration

The backend is designed to match the frontend's `db.json` structure:

- Show responses include `date` and `time` as separate fields (not `startTime`)
- All IDs match the values from `db.json`
- JSON property names match frontend expectations (`movieTitle`, `theatreId`, etc.)

## Troubleshooting

### Data not loading
- Check that `db.json` exists in `src/main/resources/`
- Check application logs for errors
- Verify database is empty (DataLoader only runs if database is empty)

### CORS errors
- Verify frontend origin is in `CorsConfig.java`
- Check browser console for specific CORS error messages

### Port already in use
- Change port in `application.yml`: `server.port: 8081`

## License

This project is part of the Book Your Show application.

