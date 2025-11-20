package com.example.bookyourshow.controller;

import com.example.bookyourshow.dto.ShowRequest;
import com.example.bookyourshow.dto.ShowResponse;
import com.example.bookyourshow.service.ShowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/shows")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ShowController {
    
    private final ShowService showService;
    
    @GetMapping
    public ResponseEntity<List<ShowResponse>> getShows(
            @RequestParam(required = false) Long theatreId,
            @RequestParam(required = false) String movieTitle) {
        List<ShowResponse> shows = showService.getShows(
            Optional.ofNullable(theatreId),
            Optional.ofNullable(movieTitle)
        );
        return ResponseEntity.ok(shows);
    }
    
    @PostMapping
    public ResponseEntity<ShowResponse> createShow(@Valid @RequestBody ShowRequest request) {
        ShowResponse response = showService.createShow(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ShowResponse> getShow(@PathVariable Long id) {
        ShowResponse response = showService.getShow(id);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ShowResponse> updateShow(@PathVariable Long id, @Valid @RequestBody ShowRequest request) {
        ShowResponse response = showService.updateShow(id, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShow(@PathVariable Long id) {
        showService.deleteShow(id);
        return ResponseEntity.noContent().build();
    }
}

