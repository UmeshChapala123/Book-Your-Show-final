package com.example.bookyourshow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TheatreResponse {
    private Long id;
    private String name;
    private String city;
    private String address;
    private Integer totalSeats;
}

