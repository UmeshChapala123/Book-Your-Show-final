package com.example.bookyourshow.service;

import com.example.bookyourshow.dto.UserRequest;
import com.example.bookyourshow.dto.UserResponse;
import com.example.bookyourshow.entity.User;

import java.util.List;

public interface UserService {
    UserResponse createUser(UserRequest request);
    UserResponse getUser(Long id);
    UserResponse getUserByEmail(String email);
    UserResponse updateUser(Long id, UserRequest request);
    void deleteUser(Long id);
    List<UserResponse> getAllUsers();
}

