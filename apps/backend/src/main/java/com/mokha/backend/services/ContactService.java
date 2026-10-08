package com.mokha.backend.services;

import com.mokha.backend.controllers.ContactController;
import org.springframework.stereotype.Service;

@Service
public class ContactService {

    public void submit(ContactController.ContactRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Le message est requis.");
        }
    }
}
