package com.example.bookyourshow.controller;

import com.example.bookyourshow.dto.TheatreRequest;
import com.example.bookyourshow.dto.TheatreResponse;
import com.example.bookyourshow.service.TheatreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theatres")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TheatreController {
    
    private final TheatreService theatreService;
    
    @GetMapping
    public ResponseEntity<List<TheatreResponse>> getAllTheatres(@RequestParam(required = false) String city) {
        List<TheatreResponse> theatres;
        if (city != null && !city.isEmpty()) {
            theatres = theatreService.getTheatresByCity(city);
        } else {
            theatres = theatreService.getAllTheatres();
        }
        return ResponseEntity.ok(theatres);
    }
    
    @PostMapping
    public ResponseEntity<TheatreResponse> createTheatre(@Valid @RequestBody TheatreRequest request) {
        TheatreResponse response = theatreService.createTheatre(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TheatreResponse> getTheatre(@PathVariable Long id) {
        TheatreResponse response = theatreService.getTheatre(id);
        return ResponseEntity.ok(response);
    }
}

