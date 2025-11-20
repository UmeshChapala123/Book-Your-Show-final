package com.example.bookyourshow.config;

import com.example.bookyourshow.entity.*;
import com.example.bookyourshow.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final TheatreRepository theatreRepository;
    private final ShowRepository showRepository;
    private final BookingRepository bookingRepository;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;
    
    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Loading data from db.json...");
        
        // Check if data already exists
        if (userRepository.count() > 0) {
            log.info("Data already exists, skipping seed data loading");
            return;
        }
        
        ClassPathResource resource = new ClassPathResource("db.json");
        InputStream inputStream = resource.getInputStream();
        JsonNode rootNode = objectMapper.readTree(inputStream);
        
        // Load users
        Map<Long, User> userMap = loadUsers(rootNode.get("users"));
        log.info("Loaded {} users", userMap.size());
        
        // Load theatres
        Map<Long, Theatre> theatreMap = loadTheatres(rootNode.get("theatres"));
        log.info("Loaded {} theatres", theatreMap.size());
        
        // Load shows
        Map<Long, Show> showMap = loadShows(rootNode.get("shows"), theatreMap);
        log.info("Loaded {} shows", showMap.size());
        
        // Load bookings
        int bookingCount = loadBookings(rootNode.get("bookings"), userMap, showMap);
        log.info("Loaded {} bookings", bookingCount);
        
        // Ensure show seatsAvailable matches db.json values (authoritative)
        ensureShowSeatsAvailable(rootNode.get("shows"), showMap);
        
        log.info("Data loading completed successfully!");
    }
    
    private Map<Long, User> loadUsers(JsonNode usersNode) {
        Map<Long, User> userMap = new HashMap<>();
        Map<Long, Integer> duplicateCount = new HashMap<>();
        
        if (usersNode != null && usersNode.isArray()) {
            for (JsonNode userNode : usersNode) {
                try {
                    Long id = parseLongId(userNode.get("id"));
                    if (id == null) continue;
                    
                    // Handle duplicates - keep the last one
                    if (userMap.containsKey(id)) {
                        duplicateCount.put(id, duplicateCount.getOrDefault(id, 0) + 1);
                        log.warn("Duplicate user ID found: {}, keeping last occurrence", id);
                    }
                    
                    String name = userNode.get("name").asText();
                    String email = userNode.get("email").asText();
                    String phone = userNode.has("phone") ? userNode.get("phone").asText() : null;
                    
                    // Insert using native SQL to preserve ID
                    jdbcTemplate.update(
                        "INSERT INTO users (id, name, email, phone, created_at) VALUES (?, ?, ?, ?, ?)",
                        id, name, email, phone, LocalDateTime.now()
                    );
                    
                    User user = new User();
                    user.setId(id);
                    user.setName(name);
                    user.setEmail(email);
                    user.setPhone(phone);
                    user.setCreatedAt(LocalDateTime.now());
                    
                    userMap.put(id, user);
                } catch (Exception e) {
                    log.error("Error loading user: {}", e.getMessage());
                }
            }
        }
        
        if (!duplicateCount.isEmpty()) {
            log.warn("Found {} duplicate user IDs during loading", duplicateCount.size());
        }
        
        return userMap;
    }
    
    private Map<Long, Theatre> loadTheatres(JsonNode theatresNode) {
        Map<Long, Theatre> theatreMap = new HashMap<>();
        Map<Long, Integer> duplicateCount = new HashMap<>();
        
        if (theatresNode != null && theatresNode.isArray()) {
            for (JsonNode theatreNode : theatresNode) {
                try {
                    Long id = parseLongId(theatreNode.get("id"));
                    if (id == null) continue;
                    
                    // Handle duplicates
                    if (theatreMap.containsKey(id)) {
                        duplicateCount.put(id, duplicateCount.getOrDefault(id, 0) + 1);
                        log.warn("Duplicate theatre ID found: {}, keeping last occurrence", id);
                    }
                    
                    String name = theatreNode.get("name").asText();
                    String city = theatreNode.get("city").asText();
                    String address = theatreNode.has("address") ? theatreNode.get("address").asText() : null;
                    
                    // Insert using native SQL to preserve ID
                    jdbcTemplate.update(
                        "INSERT INTO theatres (id, name, city, address, total_seats) VALUES (?, ?, ?, ?, ?)",
                        id, name, city, address, 0
                    );
                    
                    Theatre theatre = new Theatre();
                    theatre.setId(id);
                    theatre.setName(name);
                    theatre.setCity(city);
                    theatre.setAddress(address);
                    theatre.setTotalSeats(0);
                    
                    theatreMap.put(id, theatre);
                } catch (Exception e) {
                    log.error("Error loading theatre: {}", e.getMessage());
                }
            }
        }
        
        if (!duplicateCount.isEmpty()) {
            log.warn("Found {} duplicate theatre IDs during loading", duplicateCount.size());
        }
        
        return theatreMap;
    }
    
    private Map<Long, Show> loadShows(JsonNode showsNode, Map<Long, Theatre> theatreMap) {
        Map<Long, Show> showMap = new HashMap<>();
        Map<Long, Integer> duplicateCount = new HashMap<>();
        
        if (showsNode != null && showsNode.isArray()) {
            for (JsonNode showNode : showsNode) {
                try {
                    Long id = parseLongId(showNode.get("id"));
                    if (id == null) continue;
                    
                    // Handle duplicates
                    if (showMap.containsKey(id)) {
                        duplicateCount.put(id, duplicateCount.getOrDefault(id, 0) + 1);
                        log.warn("Duplicate show ID found: {}, keeping last occurrence", id);
                    }
                    
                    Long theatreId = parseLongId(showNode.get("theatreId"));
                    if (theatreId == null || !theatreMap.containsKey(theatreId)) {
                        log.warn("Show {} references invalid theatre ID: {}", id, theatreId);
                        continue;
                    }
                    
                    String movieTitle = showNode.get("movieTitle").asText();
                    String dateStr = showNode.get("date").asText();
                    String timeStr = showNode.get("time").asText();
                    LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
                    LocalTime time = LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("HH:mm"));
                    LocalDateTime startTime = LocalDateTime.of(date, time);
                    
                    BigDecimal price = BigDecimal.valueOf(showNode.get("price").asDouble());
                    int seatsAvailable = showNode.get("seatsAvailable").asInt();
                    
                    // Insert using native SQL to preserve ID
                    jdbcTemplate.update(
                        "INSERT INTO shows (id, movie_title, theatre_id, start_time, price, seats_available) VALUES (?, ?, ?, ?, ?, ?)",
                        id, movieTitle, theatreId, startTime, price, seatsAvailable
                    );
                    
                    Show show = new Show();
                    show.setId(id);
                    show.setMovieTitle(movieTitle);
                    show.setTheatre(theatreMap.get(theatreId));
                    show.setStartTime(startTime);
                    show.setPrice(price);
                    show.setSeatsAvailable(seatsAvailable);
                    
                    showMap.put(id, show);
                } catch (Exception e) {
                    log.error("Error loading show: {}", e.getMessage());
                }
            }
        }
        
        if (!duplicateCount.isEmpty()) {
            log.warn("Found {} duplicate show IDs during loading", duplicateCount.size());
        }
        
        return showMap;
    }
    
    private int loadBookings(JsonNode bookingsNode, Map<Long, User> userMap, Map<Long, Show> showMap) {
        int count = 0;
        Map<Long, Integer> duplicateCount = new HashMap<>();
        Map<Long, Integer> showSeatsTracker = new HashMap<>();
        
        if (bookingsNode != null && bookingsNode.isArray()) {
            for (JsonNode bookingNode : bookingsNode) {
                try {
                    Long id = parseLongId(bookingNode.get("id"));
                    if (id == null) continue;
                    
                    Long userId = parseLongId(bookingNode.get("userId"));
                    Long showId = parseLongId(bookingNode.get("showId"));
                    
                    if (userId == null || !userMap.containsKey(userId)) {
                        log.warn("Booking {} references invalid user ID: {}", id, userId);
                        continue;
                    }
                    
                    if (showId == null || !showMap.containsKey(showId)) {
                        log.warn("Booking {} references invalid show ID: {}", id, showId);
                        continue;
                    }
                    
                    // Handle duplicates - delete existing first
                    try {
                        jdbcTemplate.update("DELETE FROM bookings WHERE id = ?", id);
                    } catch (Exception e) {
                        // Ignore if doesn't exist
                    }
                    
                    int seats = bookingNode.get("seats").asInt();
                    BigDecimal totalPrice = BigDecimal.valueOf(bookingNode.get("totalPrice").asDouble());
                    String statusStr = bookingNode.get("status").asText();
                    LocalDateTime bookingTime = LocalDateTime.now();
                    
                    // Insert using native SQL to preserve ID
                    jdbcTemplate.update(
                        "INSERT INTO bookings (id, user_id, show_id, seats, total_price, status, booking_time) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        id, userId, showId, seats, totalPrice, statusStr, bookingTime
                    );
                    
                    count++;
                    
                    // Track seats for validation
                    showSeatsTracker.put(showId, showSeatsTracker.getOrDefault(showId, 0) + seats);
                    
                } catch (Exception e) {
                    log.error("Error loading booking: {}", e.getMessage());
                }
            }
        }
        
        if (!duplicateCount.isEmpty()) {
            log.warn("Found {} duplicate booking IDs during loading", duplicateCount.size());
        }
        
        // Log potential inconsistencies
        for (Map.Entry<Long, Integer> entry : showSeatsTracker.entrySet()) {
            Long showId = entry.getKey();
            Integer bookedSeats = entry.getValue();
            Show show = showMap.get(showId);
            if (show != null) {
                int currentAvailable = show.getSeatsAvailable();
                log.info("Show {}: booked {} seats, current available: {}", showId, bookedSeats, currentAvailable);
            }
        }
        
        return count;
    }
    
    private void ensureShowSeatsAvailable(JsonNode showsNode, Map<Long, Show> showMap) {
        // Re-read seatsAvailable from db.json and ensure DB matches
        if (showsNode != null && showsNode.isArray()) {
            for (JsonNode showNode : showsNode) {
                try {
                    Long id = parseLongId(showNode.get("id"));
                    if (id == null || !showMap.containsKey(id)) continue;
                    
                    int seatsAvailableFromJson = showNode.get("seatsAvailable").asInt();
                    
                    // Update to match db.json (authoritative)
                    jdbcTemplate.update(
                        "UPDATE shows SET seats_available = ? WHERE id = ?",
                        seatsAvailableFromJson, id
                    );
                    
                    Show show = showMap.get(id);
                    if (show.getSeatsAvailable() != seatsAvailableFromJson) {
                        log.info("Adjusting show {} seatsAvailable from {} to {} (db.json value)", 
                            id, show.getSeatsAvailable(), seatsAvailableFromJson);
                        show.setSeatsAvailable(seatsAvailableFromJson);
                    }
                } catch (Exception e) {
                    log.error("Error ensuring show seatsAvailable: {}", e.getMessage());
                }
            }
        }
    }
    
    private Long parseLongId(JsonNode idNode) {
        if (idNode == null) return null;
        if (idNode.isTextual()) {
            try {
                return Long.parseLong(idNode.asText());
            } catch (NumberFormatException e) {
                return null;
            }
        } else if (idNode.isNumber()) {
            return idNode.asLong();
        }
        return null;
    }
}
