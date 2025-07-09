package com.techtack.blue.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class InsufficientFundsException extends ResponseStatusException {
    public InsufficientFundsException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}
