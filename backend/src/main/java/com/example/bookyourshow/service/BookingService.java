package com.example.bookyourshow.service;

import com.example.bookyourshow.dto.BookingRequest;
import com.example.bookyourshow.dto.BookingResponse;

import java.util.List;
import java.util.Optional;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request);
    BookingResponse cancelBooking(Long bookingId);
    BookingResponse getBooking(Long id);
    List<BookingResponse> getBookingsByUser(Long userId);
    List<BookingResponse> getAllBookings(Optional<Long> userId);

    BookingResponse updateBooking(Long id, BookingRequest request);
}

