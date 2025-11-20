package com.example.bookyourshow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long userId;
    private Long showId;
    private Integer seats;
    private Double totalPrice;
    private String status;
    private LocalDateTime bookingTime;
}

