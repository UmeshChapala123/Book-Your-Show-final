package com.example.bookyourshow.service;

import com.example.bookyourshow.dto.TheatreRequest;
import com.example.bookyourshow.dto.TheatreResponse;
import com.example.bookyourshow.entity.Theatre;
import com.example.bookyourshow.exception.ResourceNotFoundException;
import com.example.bookyourshow.repository.TheatreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TheatreServiceImpl implements TheatreService {
    
    private final TheatreRepository theatreRepository;
    
    @Override
    @Transactional
    public TheatreResponse createTheatre(TheatreRequest request) {
        Theatre theatre = new Theatre();
        theatre.setName(request.getName());
        theatre.setCity(request.getCity());
        theatre.setAddress(request.getAddress());
        theatre.setTotalSeats(request.getTotalSeats() != null ? request.getTotalSeats() : 0);
        
        Theatre saved = theatreRepository.save(theatre);
        return mapToResponse(saved);
    }
    
    @Override
    public TheatreResponse getTheatre(Long id) {
        Theatre theatre = theatreRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Theatre not found with id: " + id));
        return mapToResponse(theatre);
    }
    
    @Override
    public List<TheatreResponse> getAllTheatres() {
        return theatreRepository.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<TheatreResponse> getTheatresByCity(String city) {
        return theatreRepository.findByCity(city).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    private TheatreResponse mapToResponse(Theatre theatre) {
        return new TheatreResponse(
            theatre.getId(),
            theatre.getName(),
            theatre.getCity(),
            theatre.getAddress(),
            theatre.getTotalSeats()
        );
    }
}

