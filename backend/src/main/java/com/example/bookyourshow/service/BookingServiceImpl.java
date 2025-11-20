package com.example.bookyourshow.service;

import com.example.bookyourshow.dto.BookingRequest;
import com.example.bookyourshow.dto.BookingResponse;
import com.example.bookyourshow.entity.Booking;
import com.example.bookyourshow.entity.Show;
import com.example.bookyourshow.entity.User;
import com.example.bookyourshow.exception.BadRequestException;
import com.example.bookyourshow.exception.ConflictException;
import com.example.bookyourshow.exception.ResourceNotFoundException;
import com.example.bookyourshow.repository.BookingRepository;
import com.example.bookyourshow.repository.ShowRepository;
import com.example.bookyourshow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ShowRepository showRepository;

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        Show show = showRepository.findById(request.getShowId())
                .orElseThrow(() -> new ResourceNotFoundException("Show not found with id: " + request.getShowId()));

        if (request.getSeats() <= 0) {
            throw new BadRequestException("Number of seats must be greater than 0");
        }

        if (request.getSeats() > show.getSeatsAvailable()) {
            throw new ConflictException("Not enough seats available. Available: " + show.getSeatsAvailable() + ", Requested: " + request.getSeats());
        }

        show.setSeatsAvailable(show.getSeatsAvailable() - request.getSeats());
        showRepository.save(show);

        BigDecimal totalPrice = show.getPrice().multiply(BigDecimal.valueOf(request.getSeats()));

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setShow(show);
        booking.setSeats(request.getSeats());
        booking.setTotalPrice(totalPrice);
        booking.setStatus(Booking.BookingStatus.CONFIRMED);

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        // Restore seats
        Show show = booking.getShow();
        show.setSeatsAvailable(show.getSeatsAvailable() + booking.getSeats());
        showRepository.save(show);

        // Update booking status
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(booking);

        return mapToResponse(updated);
    }

    @Override
    public BookingResponse getBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        return mapToResponse(booking);
    }

    @Override
    public List<BookingResponse> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getAllBookings(Optional<Long> userId) {
        List<Booking> bookings = userId.map(bookingRepository::findByUserId)
                .orElseGet(bookingRepository::findAll);
        return bookings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingResponse updateBooking(Long id, BookingRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        Show show = showRepository.findById(request.getShowId())
                .orElseThrow(() -> new ResourceNotFoundException("Show not found with id: " + request.getShowId()));

        if (request.getSeats() <= 0) {
            throw new BadRequestException("Number of seats must be greater than 0");
        }

        // Adjust seats if show changed or seat count changed
        int oldSeats = booking.getSeats();
        if (!booking.getShow().getId().equals(show.getId())) {
            // Restore old show seats
            Show oldShow = booking.getShow();
            oldShow.setSeatsAvailable(oldShow.getSeatsAvailable() + oldSeats);
            showRepository.save(oldShow);

            // Deduct from new show
            if (request.getSeats() > show.getSeatsAvailable()) {
                throw new ConflictException("Not enough seats available in new show");
            }
            show.setSeatsAvailable(show.getSeatsAvailable() - request.getSeats());
            showRepository.save(show);

            booking.setShow(show);
        } else if (request.getSeats() != oldSeats) {
            int diff = request.getSeats() - oldSeats;
            if (diff > 0 && diff > show.getSeatsAvailable()) {
                throw new ConflictException("Not enough seats available to increase booking");
            }
            show.setSeatsAvailable(show.getSeatsAvailable() - diff);
            showRepository.save(show);
        }

        // Update booking details
        booking.setSeats(request.getSeats());
        booking.setTotalPrice(show.getPrice().multiply(BigDecimal.valueOf(request.getSeats())));
        Booking updated = bookingRepository.save(booking);

        return mapToResponse(updated);
    }

    private BookingResponse mapToResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getUser().getId(),
                booking.getShow().getId(),
                booking.getSeats(),
                booking.getTotalPrice().doubleValue(),
                booking.getStatus().name(),
                booking.getBookingTime()
        );
    }
}
