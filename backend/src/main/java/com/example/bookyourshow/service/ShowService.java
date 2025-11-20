package com.example.bookyourshow.service;

import com.example.bookyourshow.dto.ShowRequest;
import com.example.bookyourshow.dto.ShowResponse;

import java.util.List;
import java.util.Optional;

public interface ShowService {
    ShowResponse createShow(ShowRequest request);
    ShowResponse getShow(Long id);
    List<ShowResponse> getShows(Optional<Long> theatreId, Optional<String> movieTitle);
    ShowResponse updateShow(Long id, ShowRequest request);
    void deleteShow(Long id);
}

