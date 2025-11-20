package com.example.bookyourshow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShowRequest {
    
    @NotBlank(message = "Movie title is required")
    private String movieTitle;
    
    @NotNull(message = "Theatre ID is required")
    private Long theatreId;
    
    @NotNull(message = "Date is required")
    private LocalDate date;
    
    @NotNull(message = "Time is required")
    private LocalTime time;
    
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;
    
    @NotNull(message = "Seats available is required")
    @Positive(message = "Seats available must be positive")
    private Integer seatsAvailable;
    
    private String language;
    
    private String screen;
}

