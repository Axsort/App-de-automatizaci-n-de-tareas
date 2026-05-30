package com.empresa.automation.exception;

public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String message) {
        super(message, org.springframework.http.HttpStatus.NOT_FOUND);
    }
}
