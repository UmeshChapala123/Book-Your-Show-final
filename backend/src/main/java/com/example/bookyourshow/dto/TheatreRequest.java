package com.example.bookyourshow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TheatreRequest {
    
    @NotBlank(message = "Theatre name is required")
    private String name;
    
    @NotBlank(message = "City is required")
    private String city;
    
    private String address;
    
    private Integer totalSeats;
}

