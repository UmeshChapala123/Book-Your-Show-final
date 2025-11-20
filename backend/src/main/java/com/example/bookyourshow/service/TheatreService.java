package com.example.bookyourshow.service;

import com.example.bookyourshow.dto.TheatreRequest;
import com.example.bookyourshow.dto.TheatreResponse;

import java.util.List;

public interface TheatreService {
    TheatreResponse createTheatre(TheatreRequest request);
    TheatreResponse getTheatre(Long id);
    List<TheatreResponse> getAllTheatres();
    List<TheatreResponse> getTheatresByCity(String city);
}

