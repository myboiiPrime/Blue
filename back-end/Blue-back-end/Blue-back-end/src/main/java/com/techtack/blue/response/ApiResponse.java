package com.techtack.blue.response;

import com.techtack.blue.dto.UserDto;
import lombok.Data;

import java.util.List;

@Data
public class ApiResponse {
    private String message;
    private boolean status;
}
