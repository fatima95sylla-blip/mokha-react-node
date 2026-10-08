package com.mokha.backend.controllers;

import com.mokha.backend.services.ContactService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping("/contact")
    @ResponseStatus(HttpStatus.CREATED)
    public ContactResponse submit(@Valid @RequestBody ContactRequest request) {
        contactService.submit(request);
        return new ContactResponse("Merci. Votre message a bien été transmis à l'atelier MOKHA.");
    }

    public record ContactRequest(
            @NotBlank(message = "Le nom est requis.")
            String fullName,

            @NotBlank(message = "L'e-mail est requis.")
            @Email(message = "L'e-mail doit être valide.")
            String email,

            @NotBlank(message = "L'objet est requis.")
            @Size(max = 120, message = "L'objet ne peut pas dépasser 120 caractères.")
            String subject,

            @NotBlank(message = "Le message est requis.")
            @Size(min = 10, max = 2000, message = "Le message doit contenir entre 10 et 2000 caractères.")
            String message
    ) {}

    public record ContactResponse(String message) {}
}
