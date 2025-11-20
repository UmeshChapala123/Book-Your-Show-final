package com.example.bookyourshow.service;

import com.example.bookyourshow.dto.ShowRequest;
import com.example.bookyourshow.dto.ShowResponse;
import com.example.bookyourshow.entity.Show;
import com.example.bookyourshow.entity.Theatre;
import com.example.bookyourshow.exception.ResourceNotFoundException;
import com.example.bookyourshow.repository.ShowRepository;
import com.example.bookyourshow.repository.TheatreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShowServiceImpl implements ShowService {
    
    private final ShowRepository showRepository;
    private final TheatreRepository theatreRepository;
    
    @Override
    @Transactional
    public ShowResponse createShow(ShowRequest request) {
        Theatre theatre = theatreRepository.findById(request.getTheatreId())
            .orElseThrow(() -> new ResourceNotFoundException("Theatre not found with id: " + request.getTheatreId()));
        
        Show show = new Show();
        show.setMovieTitle(request.getMovieTitle());
        show.setTheatre(theatre);
        show.setStartTime(LocalDateTime.of(request.getDate(), request.getTime()));
        show.setPrice(request.getPrice());
        show.setSeatsAvailable(request.getSeatsAvailable());
        show.setLanguage(request.getLanguage());
        show.setScreen(request.getScreen());
        
        Show saved = showRepository.save(show);
        return mapToResponse(saved);
    }
    
    @Override
    public ShowResponse getShow(Long id) {
        Show show = showRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Show not found with id: " + id));
        return mapToResponse(show);
    }
    
    @Override
    public List<ShowResponse> getShows(Optional<Long> theatreId, Optional<String> movieTitle) {
        List<Show> shows;
        
        if (theatreId.isPresent() && movieTitle.isPresent()) {
            shows = showRepository.findByTheatreId(theatreId.get()).stream()
                .filter(s -> s.getMovieTitle().toLowerCase().contains(movieTitle.get().toLowerCase()))
                .collect(Collectors.toList());
        } else if (theatreId.isPresent()) {
            shows = showRepository.findByTheatreId(theatreId.get());
        } else if (movieTitle.isPresent()) {
            shows = showRepository.findByMovieTitleContainingIgnoreCase(movieTitle.get());
        } else {
            shows = showRepository.findAll();
        }
        
        return shows.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public ShowResponse updateShow(Long id, ShowRequest request) {
        Show show = showRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Show not found with id: " + id));
        
        Theatre theatre = theatreRepository.findById(request.getTheatreId())
            .orElseThrow(() -> new ResourceNotFoundException("Theatre not found with id: " + request.getTheatreId()));
        
        show.setMovieTitle(request.getMovieTitle());
        show.setTheatre(theatre);
        show.setStartTime(LocalDateTime.of(request.getDate(), request.getTime()));
        show.setPrice(request.getPrice());
        show.setSeatsAvailable(request.getSeatsAvailable());
        show.setLanguage(request.getLanguage());
        show.setScreen(request.getScreen());
        
        Show updated = showRepository.save(show);
        return mapToResponse(updated);
    }
    
    @Override
    @Transactional
    public void deleteShow(Long id) {
        if (!showRepository.existsById(id)) {
            throw new ResourceNotFoundException("Show not found with id: " + id);
        }
        showRepository.deleteById(id);
    }
    
    private ShowResponse mapToResponse(Show show) {
        LocalDateTime startTime = show.getStartTime();
        return new ShowResponse(
            show.getId(),
            show.getMovieTitle(),
            show.getTheatre().getId(),
            startTime.toLocalDate(),
            startTime.toLocalTime(),
            show.getPrice(),
            show.getSeatsAvailable(),
            show.getLanguage(),
            show.getScreen()
        );
    }
}

